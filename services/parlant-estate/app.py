from __future__ import annotations

import json
import os
import re
import time
import uuid
import asyncio
import contextlib
import urllib.error
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from openai import OpenAI


ROOT = Path(os.environ.get("ESTATE_ROOT", "/home/ubuntu/repos/estate-planning"))
load_dotenv(ROOT / ".env")
os.environ.setdefault("PARLANT_HOME", str(ROOT / "parlant-data"))

try:
    import parlant.sdk as parlant_sdk  # type: ignore
    from parlant.client import AsyncParlantClient  # type: ignore
    from parlant.client.errors import GatewayTimeoutError, NotFoundError  # type: ignore
except Exception:  # pragma: no cover - the service still exposes a guarded adapter if SDK import fails.
    parlant_sdk = None
    AsyncParlantClient = None  # type: ignore
    GatewayTimeoutError = Exception  # type: ignore
    NotFoundError = Exception  # type: ignore

KNOWLEDGE_PATH = Path(os.environ.get("ESTATE_KNOWLEDGE_PATH", ROOT / "data" / "estate-knowledge.json"))
LEADS_PATH = Path(os.environ.get("ESTATE_LEADS_PATH", ROOT / "data" / "leads" / "estate-handoffs.jsonl"))
MODEL_PROVIDER = os.environ.get("MODEL_PROVIDER", "").strip().lower()
MODEL_ID = os.environ.get("MODEL_ID", "gpt-5-nano-2025-08-07").strip()
MODEL_TOOL_POLICY = os.environ.get("MODEL_TOOL_POLICY", "prefer_tools").strip().lower()
TWENTY_BASE_URL = os.environ.get("TWENTY_BASE_URL", "http://127.0.0.1:3010").rstrip("/")
TWENTY_API_TOKEN = os.environ.get("TWENTY_API_TOKEN", "").strip()
PARLANT_NATIVE_ENABLED = os.environ.get("PARLANT_NATIVE_ENABLED", "auto").strip().lower()
PARLANT_NLP_SERVICE = os.environ.get("PARLANT_NLP_SERVICE", "auto").strip().lower()
PARLANT_OPENAI_SCHEMATIC_MODEL = os.environ.get("PARLANT_OPENAI_SCHEMATIC_MODEL", "gpt-4.1-nano").strip().lower()
EMCIE_MODEL_TIER = os.environ.get("EMCIE_MODEL_TIER", "").strip().lower()
PARLANT_NATIVE_PORT = int(os.environ.get("PARLANT_NATIVE_PORT", "8801"))
PARLANT_NATIVE_TOOL_PORT = int(os.environ.get("PARLANT_NATIVE_TOOL_PORT", "8819"))
PARLANT_NATIVE_BASE_URL = os.environ.get(
    "PARLANT_NATIVE_BASE_URL",
    f"http://127.0.0.1:{PARLANT_NATIVE_PORT}",
).rstrip("/")
PARLANT_AGENT_ID = os.environ.get("PARLANT_AGENT_ID", "pathway-estate-planning").strip()


class ChatMessage(BaseModel):
    role: str
    content: str = ""


class ChatRequest(BaseModel):
    id: str | None = None
    messages: list[ChatMessage] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class ChatResponse(BaseModel):
    id: str
    text: str
    matchedRoutes: list[str] = Field(default_factory=list)
    handoff: dict[str, Any] | None = None
    guardrails: list[str] = Field(default_factory=list)
    navigation: dict[str, Any] | None = None
    model: dict[str, Any] = Field(default_factory=dict)


@dataclass
class KnowledgePage:
    route: str
    title: str
    text: str


# Seed targets keep important copy and synonyms available if the generated graph is missing
# or sparse. The generated siteGraph is the primary navigation source at runtime.
NAV_TARGETS: list[dict[str, Any]] = [
    {
        "title": "Estate planning overview",
        "url": "/estate-planning",
        "summary": "A calm overview of planning wishes, family protection, wills, trusts, LPAs, and later-life decisions.",
        "keywords": ["estate planning", "whole plan", "protect family", "where start", "not sure", "overview", "everything together"],
    },
    {
        "title": "Wills",
        "url": "/wills",
        "summary": "How Pathway helps record wishes clearly and appoint the right people.",
        "keywords": ["will", "wills", "write a will", "last wishes", "executor", "inherit", "leave money", "children guardian"],
    },
    {
        "title": "Trusts",
        "url": "/trusts",
        "summary": "Trust planning for protecting assets and supporting children, vulnerable family, or future generations.",
        "keywords": ["trust", "trusts", "trustee", "beneficiary", "asset protection", "protect assets", "future generations", "second marriage", "blended family", "children from first marriage", "children from previous marriage", "life interest", "property protection", "protect the house"],
    },
    {
        "title": "Lasting Powers of Attorney",
        "url": "/lpa",
        "summary": "Choosing trusted people to make decisions if you cannot make them yourself.",
        "keywords": ["lpa", "lasting power attorney", "power of attorney", "capacity", "mental capacity", "memory problems", "mum has memory problems", "dad has memory problems", "health decisions", "finance decisions", "what if"],
    },
    {
        "title": "Inheritance tax planning",
        "url": "/inheritance-tax-planning",
        "summary": "Plain-English support around mitigating tax and planning ahead.",
        "keywords": ["inheritance tax", "iht", "mitigating tax", "tax planning", "tax exposure", "allowance", "relief"],
    },
    {
        "title": "Care planning",
        "url": "/care-planning",
        "summary": "Later-life care planning, practical decisions, and family conversations.",
        "keywords": ["care", "care planning", "care costs", "care fees", "care home fees", "later life", "later-life care", "care home", "home care", "elderly parent", "funding care", "paying for care"],
    },
    {
        "title": "Business protection",
        "url": "/business-protection",
        "summary": "Planning for business owners and continuity if circumstances change.",
        "keywords": ["business", "company", "shareholder", "business owner", "partnership", "succession"],
    },
    {
        "title": "Agricultural land",
        "url": "/agricultural-land",
        "summary": "Specialist planning considerations for farms, agricultural land, and rural estates.",
        "keywords": ["farm", "farming", "agricultural", "land", "rural estate", "acreage"],
    },
    {
        "title": "Asset protection",
        "url": "/asset-protection",
        "summary": "Ways to think about protecting what you have built for the people you care about.",
        "keywords": ["asset protection", "protect wealth", "protect property", "family assets", "house", "home"],
    },
    {
        "title": "How it works",
        "url": "/how-it-works",
        "summary": "The step-by-step process for an initial chat, planning, drafting, signing, and ongoing support.",
        "keywords": ["how it works", "process", "steps", "what happens", "where start", "start", "not sure", "first step", "appointment", "drafting", "signing", "next step"],
    },
    {
        "title": "Extended services",
        "url": "/extended-services",
        "summary": "Probate, estate administration, and connected support beyond core planning documents.",
        "keywords": ["extended services", "probate", "grant of probate", "estate administration", "property support", "financial advice", "connected advice", "related support"],
    },
    {
        "title": "Estate planning checklist",
        "url": "/helpful-info",
        "summary": "Helpful checklist-style guidance for reviewing key estate planning decisions.",
        "keywords": ["checklist", "estate planning checklist", "helpful information", "guide", "guides", "what to check", "review documents"],
    },
    {
        "title": "Frequently asked questions",
        "url": "/faq",
        "summary": "Common questions families ask before getting started.",
        "keywords": ["faq", "question", "questions", "common questions", "answers", "how long", "cost", "fee"],
    },
    {
        "title": "Glossary of terms",
        "url": "/glossary",
        "summary": "Plain-English explanations of estate planning terms.",
        "keywords": ["glossary", "terms", "jargon", "meaning", "define", "definition", "executor", "trustee", "probate"],
    },
    {
        "title": "Contact Pathway",
        "url": "/contact",
        "summary": "Call, email, or arrange a conversation with Pathway.",
        "keywords": ["contact", "book", "call", "call me", "evening call", "phone", "email", "speak", "speak to someone", "talk to someone", "appointment", "chat", "human", "sensitive details"],
    },
    {
        "title": "The cost of doing nothing",
        "url": "/#cost-of-doing-nothing",
        "summary": "Homepage section explaining what can happen when no plan is in place.",
        "keywords": ["doing nothing", "no plan", "family guess", "intestacy", "delay", "dispute", "court decides"],
    },
    {
        "title": "Why families choose Pathway",
        "url": "/#why-families-choose-us",
        "summary": "Homepage section about personal service, experience, and clear advice.",
        "keywords": ["why choose", "why pathway", "experience", "personal", "qualified", "insured", "reassurance"],
    },
    {
        "title": "Homepage services",
        "url": "/#services",
        "summary": "Homepage service cards for the full range handled by Pathway.",
        "keywords": ["services", "what help", "full range", "cards", "service list"],
    },
    {
        "title": "Client stories",
        "url": "/#reviews",
        "summary": "Homepage client stories and outcome examples.",
        "keywords": ["review", "reviews", "testimonial", "testimonials", "client stories", "what clients say", "feedback"],
    },
    {
        "title": "Where Pathway works",
        "url": "/#where-we-work",
        "summary": "Leamington Spa and Warwickshire location information.",
        "keywords": ["where we work", "location", "leamington", "warwickshire", "home visits", "office", "visit"],
    },
    {
        "title": "Newsletter",
        "url": "/#newsletter",
        "summary": "Plain-English guides and lighter estate-planning stories.",
        "keywords": ["newsletter", "guides", "celebrity", "stories", "sign up", "updates"],
    },
]

SITE_GRAPH_CACHE: dict[str, Any] = {
    "mtime": None,
    "targets": None,
}

CURATED_TOPICS: dict[str, dict[str, Any]] = {
    "start": {
        "title": "Where to start",
        "routes": ["/estate-planning", "/how-it-works", "/wills", "/lpa", "/contact"],
        "triggers": ["where start", "start", "not sure", "don't know", "dont know", "what need", "begin", "first step"],
        "answer": (
            "A good place to start is with what you want to make easier for your family.\n\n"
            "Most people begin with three building blocks:\n"
            "- a Will, so your wishes are clear\n"
            "- Lasting Powers of Attorney, so trusted people can help if you cannot make decisions\n"
            "- a wider estate-planning conversation if tax, care, property, trusts, business assets, or blended-family questions are involved\n\n"
            "You do not need to know the answer before speaking to Pathway. The first conversation is there to work out what matters, what is simple, and what might need more careful planning."
        ),
    },
    "/wills": {
        "title": "Wills",
        "routes": ["/wills", "/estate-planning", "/helpful-info"],
        "triggers": ["will", "wills", "executor", "last wishes", "inherit", "children guardian"],
        "answer": (
            "A Will records what you want to happen to your estate and who should deal with things when the time comes.\n\n"
            "It can help with:\n"
            "- naming executors you trust\n"
            "- setting out who should inherit\n"
            "- reducing confusion or family disagreement\n"
            "- making provision for children, partners, charities, or specific gifts\n\n"
            "Pathway's role is to make that feel clear and manageable, then prepare the document properly around your wishes."
        ),
    },
    "/trusts": {
        "title": "Trusts",
        "routes": ["/trusts", "/asset-protection", "/estate-planning"],
        "triggers": ["trust", "trusts", "trustee", "beneficiary", "protect assets", "future generations", "children"],
        "answer": (
            "A Trust is a way of holding assets for someone else under agreed rules.\n\n"
            "People often ask about trusts when they want more control over how inheritance is used, want to protect vulnerable beneficiaries, or need planning for a more complex family situation.\n\n"
            "They can be useful, but they are not automatically right for everyone. Pathway would usually explain the options in plain English and only suggest a trust if it genuinely fits the circumstances."
        ),
    },
    "/lpa": {
        "title": "Lasting Powers of Attorney",
        "routes": ["/lpa", "/care-planning", "/estate-planning"],
        "triggers": ["lpa", "lasting power", "power of attorney", "capacity", "health decisions", "finance decisions"],
        "answer": (
            "A Lasting Power of Attorney lets you choose trusted people to make decisions if you cannot make them yourself.\n\n"
            "There are two main types: one for property and financial affairs, and one for health and welfare. Putting them in place early can make life much easier for family members if something unexpected happens.\n\n"
            "Pathway can explain the choices and help make sure the documents reflect who you trust and how you want decisions handled."
        ),
    },
    "/inheritance-tax-planning": {
        "title": "Inheritance tax planning",
        "routes": ["/inheritance-tax-planning", "/estate-planning", "/trusts"],
        "triggers": ["inheritance tax", "iht", "tax planning", "mitigating tax", "tax exposure"],
        "answer": (
            "Inheritance tax planning is about understanding what may apply to your estate and whether sensible planning could reduce unnecessary exposure.\n\n"
            "That might involve wills, trusts, gifts, allowances, reliefs, or wider estate planning. The right route depends heavily on the assets, family situation, and timing.\n\n"
            "Pathway can talk through the broad options, but anything tax-specific should be handled as personal advice rather than a quick chat answer."
        ),
    },
    "/care-planning": {
        "title": "Care planning",
        "routes": ["/care-planning", "/lpa", "/estate-planning"],
        "triggers": ["care", "care planning", "care costs", "later life", "care home", "elderly parent"],
        "answer": (
            "Care planning is about preparing for later-life decisions before everything feels urgent.\n\n"
            "It can include conversations about care options, family roles, powers of attorney, and how decisions may be made if health or capacity changes.\n\n"
            "Pathway keeps this practical and human: what needs putting in place, what can wait, and where specialist advice may be needed."
        ),
    },
    "/business-protection": {
        "title": "Business protection",
        "routes": ["/business-protection", "/estate-planning", "/asset-protection"],
        "triggers": ["business protection", "business", "company", "shareholder", "director", "business owner", "succession", "continuity"],
        "answer": (
            "Business protection is about making sure a business, and the people who rely on it, are not left exposed if circumstances change.\n\n"
            "Pathway frames this as part of wider estate planning: who should take control, how business assets are protected for family or partners, and how disruption can be reduced.\n\n"
            "It can sit alongside your Will and wider estate plan, so business interests are considered clearly rather than being left as a separate loose end."
        ),
    },
}

PATHWAY_GLOSSARY_TERMS: list[dict[str, Any]] = [
    {
        "id": "pathway-term-will",
        "name": "Will",
        "description": "A legal document that records wishes for an estate and appoints executors.",
        "synonyms": ["wills", "last will", "testament", "wishes"],
    },
    {
        "id": "pathway-term-trust",
        "name": "Trust",
        "description": "An arrangement where assets are held under agreed rules for beneficiaries.",
        "synonyms": ["trusts", "trust planning", "life interest", "property protection"],
    },
    {
        "id": "pathway-term-trustee",
        "name": "Trustee",
        "description": "A person or organisation responsible for managing a trust.",
        "synonyms": ["trustees"],
    },
    {
        "id": "pathway-term-executor",
        "name": "Executor",
        "description": "Someone appointed in a Will to deal with the estate when the time comes.",
        "synonyms": ["executors", "personal representative"],
    },
    {
        "id": "pathway-term-beneficiary",
        "name": "Beneficiary",
        "description": "A person or organisation who may receive something from an estate or trust.",
        "synonyms": ["beneficiaries", "inherit", "inheritance"],
    },
    {
        "id": "pathway-term-lpa",
        "name": "Lasting Power of Attorney",
        "description": "A document appointing trusted people to make decisions if someone cannot make them.",
        "synonyms": ["LPA", "LPAs", "power of attorney", "capacity", "memory problems"],
    },
    {
        "id": "pathway-term-probate",
        "name": "Probate",
        "description": "The process of dealing with an estate after someone has died.",
        "synonyms": ["grant of probate", "estate administration"],
    },
    {
        "id": "pathway-term-inheritance-tax",
        "name": "Inheritance Tax",
        "description": "A tax that may apply to an estate, depending on value, reliefs, and circumstances.",
        "synonyms": ["IHT", "tax exposure", "tax planning"],
    },
    {
        "id": "pathway-term-intestacy",
        "name": "Rules of Intestacy",
        "description": "The rules that decide who inherits when someone dies without a valid Will.",
        "synonyms": ["intestacy", "no will"],
    },
    {
        "id": "pathway-term-care-planning",
        "name": "Care Planning",
        "description": "Preparing for later-life decisions, care choices, funding conversations, and family roles.",
        "synonyms": ["care costs", "care fees", "care home", "later-life care"],
    },
    {
        "id": "pathway-term-mitigating-tax",
        "name": "Mitigating Tax",
        "description": "Considering legitimate planning options that may reduce unnecessary tax exposure.",
        "synonyms": ["mitigate tax", "reducing tax", "inheritance tax planning"],
    },
]

PATHWAY_GUIDELINES: list[dict[str, str]] = [
    {
        "id": "pathway-guideline-no-definitive-advice",
        "condition": "The visitor asks about legal, tax, financial, probate, care-funding, or eligibility advice",
        "action": "Explain only general website information, never give definitive advice, and suggest speaking with Pathway for personal circumstances.",
    },
    {
        "id": "pathway-guideline-no-invented-specifics",
        "condition": "The visitor asks about fees, timeframes, tax savings, outcomes, eligibility, or availability",
        "action": "Do not invent numbers, costs, timings, guarantees, or outcomes. Explain that Pathway can confirm scope and costs directly.",
    },
    {
        "id": "pathway-guideline-tone",
        "condition": "The visitor asks any Pathway estate planning question",
        "action": "Use warm plain English, short paragraphs, and a calm supportive tone. Avoid morbid framing and avoid jargon where possible.",
    },
    {
        "id": "pathway-guideline-knowledge-boundary",
        "condition": "The answer is not grounded in the Pathway knowledgebase or retriever context",
        "action": "Say that the knowledgebase does not confirm it, then offer a human follow-up instead of guessing.",
    },
    {
        "id": "pathway-guideline-urgent-sensitive",
        "condition": "The visitor mentions urgent deadlines, disputes, safeguarding, complex tax, business, land, or sensitive personal circumstances",
        "action": "Keep the answer general and recommend speaking directly with Pathway. Do not ask for sensitive details in chat.",
    },
]

PARLANT_NATIVE_STATE: dict[str, Any] = {
    "status": "disabled",
    "agentId": PARLANT_AGENT_ID,
    "baseUrl": PARLANT_NATIVE_BASE_URL,
    "error": "",
    "task": None,
    "client": None,
    "sessions": {},
    "bootstrap": {
        "guidelines": 0,
        "terms": 0,
        "retrievers": 0,
        "tools": 0,
    },
}


def load_knowledge() -> dict[str, Any]:
    if not KNOWLEDGE_PATH.exists():
        return {
            "pages": [],
            "glossary": [],
            "guardrails": [],
            "contact": {
                "phone": "07902 863999",
                "email": "info@pathwayestateplanning.co.uk",
                "location": "Leamington Spa, Warwickshire",
            },
        }
    return json.loads(KNOWLEDGE_PATH.read_text())


def knowledge_mtime() -> float | None:
    try:
        return KNOWLEDGE_PATH.stat().st_mtime
    except FileNotFoundError:
        return None


def tokenize(value: str) -> set[str]:
    stop = {
        "about",
        "after",
        "also",
        "and",
        "are",
        "can",
        "for",
        "from",
        "have",
        "help",
        "how",
        "into",
        "our",
        "pathway",
        "that",
        "the",
        "their",
        "this",
        "through",
        "what",
        "when",
        "where",
        "with",
        "you",
        "your",
    }
    tokens: set[str] = set()
    for token in re.findall(r"[a-z0-9']+", value.lower()):
        if len(token) <= 2 or token in stop:
            continue
        tokens.add(token)
        if token.endswith("s") and len(token) > 3:
            tokens.add(token[:-1])
    return tokens


def page_records(knowledge: dict[str, Any]) -> list[KnowledgePage]:
    return [
        KnowledgePage(
            route=str(page.get("route", "")),
            title=str(page.get("title", "")),
            text=str(page.get("text", "")),
        )
        for page in knowledge.get("pages", [])
        if page.get("text")
    ]


def retrieve(query: str, knowledge: dict[str, Any], limit: int = 3) -> list[KnowledgePage]:
    query_tokens = tokenize(query)
    if not query_tokens:
        return []
    scored: list[tuple[int, KnowledgePage]] = []
    for page in page_records(knowledge):
        page_tokens = tokenize(f"{page.title} {page.route.replace('-', ' ')}")
        text_tokens = tokenize(page.text)
        score = (len(query_tokens & page_tokens) * 4) + len(query_tokens & text_tokens)
        if score:
            scored.append((score, page))
    scored.sort(key=lambda item: item[0], reverse=True)
    top_score = scored[0][0] if scored else 0
    scored = [item for item in scored if item[0] >= max(2, int(top_score * 0.45))]
    pages = [page for _, page in scored]
    non_home = [page for page in pages if page.route != "/"]
    return (non_home or pages)[:limit]


def native_parlant_enabled() -> bool:
    if PARLANT_NATIVE_ENABLED in {"0", "false", "no", "off", "disabled"}:
        return False
    if not parlant_sdk or not AsyncParlantClient:
        return False
    if PARLANT_NLP_SERVICE == "emcie":
        return bool(os.environ.get("EMCIE_API_KEY"))
    if PARLANT_NLP_SERVICE == "auto" and os.environ.get("EMCIE_API_KEY"):
        return True
    return bool(os.environ.get("OPENAI_API_KEY"))


def pathway_native_nlp_service(container: Any) -> Any:
    if PARLANT_NLP_SERVICE == "emcie" or (PARLANT_NLP_SERVICE == "auto" and os.environ.get("EMCIE_API_KEY")):
        return parlant_sdk.NLPServices.emcie(container)

    if PARLANT_NLP_SERVICE in {"openai", "openai-default"}:
        return parlant_sdk.NLPServices.openai(container)

    from parlant.adapters.nlp.openai_service import GPT_4_1_Nano, GPT_5_Nano, OpenAIService

    schematic_generators = {
        "gpt-4.1-nano": GPT_4_1_Nano,
        "gpt-5-nano": GPT_5_Nano,
    }
    schematic_generator = schematic_generators.get(PARLANT_OPENAI_SCHEMATIC_MODEL, GPT_4_1_Nano)

    class PathwayOpenAIService(OpenAIService):
        async def get_schematic_generator(self, t: type[Any], hints: dict[str, Any] = {}) -> Any:
            return schematic_generator[t](self._logger, self._tracer, self._meter)  # type: ignore[index]

    return PathwayOpenAIService(container[parlant_sdk.Logger], container[parlant_sdk.Tracer], container[parlant_sdk.Meter])


def native_event_offset(event: Any) -> int:
    try:
        return int(getattr(event, "offset"))
    except Exception:
        if isinstance(event, dict):
            return int(event.get("offset", 0) or 0)
    return 0


def native_event_message(event: Any) -> str:
    data = native_event_data(event)
    if isinstance(data, dict):
        message = data.get("message")
        if isinstance(message, str):
            return message.strip()
        chunks = data.get("chunks")
        if isinstance(chunks, list):
            return "".join(chunk for chunk in chunks if isinstance(chunk, str)).strip()
    return ""


def native_event_kind(event: Any) -> str:
    value = getattr(event, "kind", "")
    if isinstance(event, dict):
        value = event.get("kind", value)
    return str(getattr(value, "value", value) or "")


def native_event_status(event: Any) -> str:
    data = native_event_data(event)
    if isinstance(data, dict):
        status = data.get("status") or data.get("data", {}).get("stage")
        return str(status or "")
    return ""


def native_event_tags(event: Any) -> list[str]:
    data = native_event_data(event)
    if isinstance(data, dict):
        tags = data.get("tags")
        if isinstance(tags, list):
            return [str(tag) for tag in tags]
    return []


def native_event_data(event: Any) -> dict[str, Any]:
    data = getattr(event, "data", None)
    if data is None and isinstance(event, dict):
        data = event.get("data")
    if hasattr(data, "model_dump"):
        with contextlib.suppress(Exception):
            data = data.model_dump()
    if isinstance(data, dict):
        return data
    return {}


async def pathway_knowledge_retriever(context: Any) -> Any:
    if not parlant_sdk:
        return None

    message = ""
    with contextlib.suppress(Exception):
        if context.interaction.last_customer_message:
            message = context.interaction.last_customer_message.content

    knowledge = load_knowledge()
    pages = retrieve(message, knowledge, limit=4)
    targets = score_navigation(message, cached_site_graph(knowledge), pages)[:4] if message else []
    data = {
        "matchedPages": [
            {
                "title": page.title,
                "route": page.route,
                "content": re.sub(r"\s+", " ", page.text).strip()[:900],
            }
            for page in pages
        ],
        "siteTargets": [
            {
                "title": target.get("title"),
                "url": target.get("url"),
                "summary": target.get("summary"),
                "score": score,
            }
            for score, target in targets
        ],
        "contact": knowledge.get("contact", {}),
    }
    return parlant_sdk.RetrieverResult(
        data=data,
        metadata={"source": "estate-knowledge", "knowledgePath": str(KNOWLEDGE_PATH)},
        guidelines=[
            {
                "condition": "Answering Pathway website visitors",
                "action": (
                    "Ground the answer in the retrieved Pathway website context. If the context does not contain the answer, "
                    "say so briefly and offer a human follow-up. Keep the response general, warm, and concise."
                ),
                "criticality": "high",
                "priority": 90,
            }
        ],
    )


def make_native_handoff_tool() -> Any:
    if not parlant_sdk:
        return None

    async def request_human_handoff(context: Any, reason: str = "") -> Any:
        return parlant_sdk.ToolResult(
            data={
                "status": "handoff_requested",
                "reason": reason or "The visitor wants to speak with Pathway or needs advice beyond general information.",
                "instruction": "Ask only for minimal contact details and explain that Pathway will follow up.",
            },
            metadata={"handoff": True, "source": "parlant_tool"},
            control={"mode": "manual"},
            guidelines=[
                {
                    "condition": "A human handoff has been requested",
                    "action": (
                        "Explain the transition professionally. Ask only for name and either phone or email. "
                        "Do not ask for sensitive legal, financial, health, or family details in chat."
                    ),
                    "criticality": "high",
                    "priority": 100,
                }
            ],
        )

    # Parlant validates annotations by identity at decoration time. Because this
    # module uses postponed annotations, set the concrete SDK classes manually.
    request_human_handoff.__annotations__["context"] = parlant_sdk.ToolContext
    request_human_handoff.__annotations__["reason"] = str
    request_human_handoff.__annotations__["return"] = parlant_sdk.ToolResult
    return parlant_sdk.tool(request_human_handoff)


async def bootstrap_native_parlant_agent(server: Any) -> Any:
    handoff_tool = make_native_handoff_tool()
    existing = await server.find_agent(id=PARLANT_AGENT_ID)
    agent = existing or await server.create_agent(
        id=PARLANT_AGENT_ID,
        name="Pathway Estate Planning",
        description=(
            "A guarded public website assistant for Pathway Estate Planning. It explains general information "
            "about Wills, Trusts, LPAs, care planning, inheritance tax planning, business protection, and related "
            "estate planning topics in plain English. It never gives definitive legal, tax, financial, probate, or care-funding advice."
        ),
        composition_mode=parlant_sdk.CompositionMode.FLUID,
        output_mode=parlant_sdk.OutputMode.BLOCK,
        max_engine_iterations=3,
    )

    terms_created = 0
    for term in PATHWAY_GLOSSARY_TERMS:
        with contextlib.suppress(Exception):
            await agent.create_term(
                id=term["id"],
                name=term["name"],
                description=term["description"],
                synonyms=term.get("synonyms", []),
            )
            terms_created += 1

    guidelines_created = 0
    for guideline in PATHWAY_GUIDELINES:
        with contextlib.suppress(Exception):
            await agent.create_guideline(
                id=guideline["id"],
                condition=guideline["condition"],
                action=guideline["action"],
                criticality=parlant_sdk.Criticality.HIGH,
                priority=90,
                metadata={"source": "pathway_bootstrap"},
            )
            guidelines_created += 1

    if handoff_tool:
        with contextlib.suppress(Exception):
            await agent.create_guideline(
                id="pathway-guideline-human-handoff-tool",
                condition="The visitor explicitly asks to book, be contacted, speak with a person, arrange a call, or send their contact details",
                action="Initiate a human handoff only for explicit contact or booking requests, then explain that only minimal contact details are needed.",
                tools=[handoff_tool],
                criticality=parlant_sdk.Criticality.HIGH,
                priority=100,
                metadata={"source": "pathway_bootstrap", "tool": "request_human_handoff"},
            )
            guidelines_created += 1

    await agent.attach_retriever(pathway_knowledge_retriever, id="pathway-estate-knowledge")

    PARLANT_NATIVE_STATE["bootstrap"] = {
        "guidelines": max(guidelines_created, len(PATHWAY_GUIDELINES)),
        "terms": max(terms_created, len(PATHWAY_GLOSSARY_TERMS)),
        "retrievers": 1,
        "tools": 1 if handoff_tool else 0,
    }
    return agent


async def mark_native_parlant_ready(server: Any) -> None:
    await server.ready.wait()
    PARLANT_NATIVE_STATE["client"] = AsyncParlantClient(base_url=PARLANT_NATIVE_BASE_URL, timeout=30.0)
    PARLANT_NATIVE_STATE["status"] = "ready"
    PARLANT_NATIVE_STATE["error"] = ""


async def run_native_parlant_sidecar() -> None:
    if not native_parlant_enabled():
        PARLANT_NATIVE_STATE["status"] = "disabled"
        if PARLANT_NLP_SERVICE == "emcie" and not os.environ.get("EMCIE_API_KEY"):
            PARLANT_NATIVE_STATE["error"] = "EMCIE_API_KEY is not set"
        elif not os.environ.get("OPENAI_API_KEY"):
            PARLANT_NATIVE_STATE["error"] = "OPENAI_API_KEY is not set"
        elif not parlant_sdk:
            PARLANT_NATIVE_STATE["error"] = "parlant.sdk is not importable"
        return

    PARLANT_NATIVE_STATE["status"] = "bootstrapping"
    PARLANT_NATIVE_STATE["error"] = ""
    try:
        server = parlant_sdk.Server(
            host="127.0.0.1",
            port=PARLANT_NATIVE_PORT,
            tool_service_port=PARLANT_NATIVE_TOOL_PORT,
            nlp_service=pathway_native_nlp_service,
            session_store="local",
            customer_store="local",
            variable_store="local",
            log_level=parlant_sdk.LogLevel.WARNING,
            migrate=False,
        )
        async with server:
            agent = await bootstrap_native_parlant_agent(server)
            PARLANT_NATIVE_STATE["agentId"] = str(agent.id)
            PARLANT_NATIVE_STATE["status"] = "starting"
            asyncio.create_task(mark_native_parlant_ready(server))
    except asyncio.CancelledError:
        PARLANT_NATIVE_STATE["status"] = "stopped"
        raise
    except BaseException as error:
        PARLANT_NATIVE_STATE["status"] = "failed"
        PARLANT_NATIVE_STATE["error"] = f"{error.__class__.__name__}: {error}"


async def native_parlant_answer(
    request: ChatRequest,
    user_text: str,
    draft_answer: str,
) -> tuple[str, dict[str, Any]]:
    metadata = {
        "provider": "parlant",
        "id": PARLANT_AGENT_ID,
        "baseUrl": PARLANT_NATIVE_BASE_URL,
        "configured": native_parlant_enabled(),
        "status": PARLANT_NATIVE_STATE.get("status", "unknown"),
        "used": False,
    }

    if not native_parlant_enabled() or not user_text:
        metadata["error"] = PARLANT_NATIVE_STATE.get("error") or "NativeParlantDisabled"
        return draft_answer, metadata

    client = PARLANT_NATIVE_STATE.get("client")
    if client is None or PARLANT_NATIVE_STATE.get("status") != "ready":
        metadata["error"] = PARLANT_NATIVE_STATE.get("error") or "NativeParlantNotReady"
        return draft_answer, metadata

    chat_id = request.id or f"chat_{uuid.uuid4().hex[:12]}"
    sessions = PARLANT_NATIVE_STATE.setdefault("sessions", {})
    session_id = sessions.get(chat_id)

    try:
        if not session_id:
            session = await client.sessions.create(
                agent_id=PARLANT_AGENT_ID,
                allow_greeting=False,
                title=f"Pathway chat {chat_id}",
                metadata={
                    "chatId": chat_id,
                    "pageUrl": str(request.metadata.get("pageUrl", "")),
                    "source": "estate-planning-site",
                },
                labels=["pathway-estate"],
            )
            session_id = str(session.id)
            sessions[chat_id] = session_id

        event = await client.sessions.create_event(
            session_id,
            kind="message",
            source="customer",
            message=user_text,
            metadata={"chatId": chat_id},
        )
        min_offset = native_event_offset(event) + 1
        collected_messages: list[str] = []
        seen_message_offsets: set[int] = set()
        deadline = time.time() + 55
        ready_after_answer = False
        while time.time() < deadline and not ready_after_answer:
            try:
                events = await client.sessions.list_events(
                    session_id,
                    min_offset=min_offset,
                    source="ai_agent",
                    kinds="message,status",
                    wait_for_data=6,
                )
            except GatewayTimeoutError:
                if collected_messages:
                    break
                continue
            if not events:
                continue
            min_offset = max(native_event_offset(item) for item in events) + 1
            for item in events:
                kind = native_event_kind(item)
                message = native_event_message(item)
                if kind == "message" or message:
                    if "__preamble__" in native_event_tags(item):
                        continue
                    offset = native_event_offset(item)
                    if message and offset not in seen_message_offsets:
                        seen_message_offsets.add(offset)
                        collected_messages.append(message)
                if kind == "status" and collected_messages and native_event_status(item).lower() == "ready":
                    ready_after_answer = True

        if not collected_messages:
            with contextlib.suppress(Exception):
                events = await client.sessions.list_events(
                    session_id,
                    min_offset=0,
                    source="ai_agent",
                    kinds="message,status",
                    wait_for_data=0,
                )
                for item in events:
                    message = native_event_message(item)
                    offset = native_event_offset(item)
                    if message and "__preamble__" not in native_event_tags(item) and offset not in seen_message_offsets:
                        seen_message_offsets.add(offset)
                        collected_messages.append(message)
    except (GatewayTimeoutError, NotFoundError):
        if session_id:
            sessions.pop(chat_id, None)
        metadata["error"] = "NativeParlantNoResponse"
        return draft_answer, metadata
    except Exception as error:
        metadata["error"] = error.__class__.__name__
        return draft_answer, metadata

    answer = "\n\n".join(collected_messages).strip()
    if not answer:
        metadata["error"] = "NativeParlantEmptyResponse"
        return draft_answer, metadata

    metadata["used"] = True
    metadata["sessionId"] = session_id
    return answer, metadata


def phrase_tokens(phrases: list[str]) -> set[str]:
    return set().union(*(tokenize(phrase) for phrase in phrases))


def navigation_intent(text: str) -> bool:
    lowered = text.lower().strip()
    if not lowered:
        return False

    explicit_patterns = [
        r"\b(take me|show me|show your|show|bring me|go to|jump to|find|open|navigate|send me)\b",
        r"\b(where is|where are|where's|wheres|where do you|where on the site)\b",
        r"\bwhere\b.{0,80}\b(talk|mention|explain|cover|list|show|define|describe|find)\b",
        r"\b(more info|more information|read about|read more|learn more|details on|page for|section for)\b",
        r"\b(what does .+ mean|define .+|meaning of .+)\b",
    ]
    if any(re.search(pattern, lowered) for pattern in explicit_patterns):
        return True

    # Softer "site seeking" language. These are phrased like questions, but the
    # user is still trying to locate supporting content rather than receive only
    # a general explanation.
    soft_patterns = [
        r"\b(do you|does pathway|have you|have you got)\b.{0,80}\b(cover|covers|covered|mention|mentions|talk about|explain|explains|anything on|anything about|a page|a section|information on|info on)\b",
        r"\b(is there|are there)\b.{0,80}\b(anything|a page|a section|information|info|details|guidance)\b.{0,60}\b(on|about|for|around)\b",
        r"\b(can i|could i|can we|could we)\b.{0,80}\b(read|see|look at|look through|find|learn more|read more)\b.{0,60}\b(on|about|for|around)?\b",
        r"\b(where can i|where could i)\b.{0,80}\b(read|see|find|learn|look)\b",
        r"\b(i'?m|i am|we'?re|we are)\b.{0,40}\b(looking for|trying to find|trying to read|trying to see)\b",
        r"\b(tell me|talk me|walk me)\b.{0,30}\b(through|more about|around)\b",
    ]
    if any(re.search(pattern, lowered) for pattern in soft_patterns):
        return True

    glossary_terms = r"(probate|beneficiary|beneficiaries|executor|executors|trustee|trustees|intestacy|rules of intestacy|lpa|lasting power of attorney)"
    if re.search(rf"\bwhat is (?:a |an |the )?{glossary_terms}\b", lowered):
        return True

    return False


def followup_navigation_intent(text: str) -> bool:
    return bool(
        re.search(
            r"\b(yes|yeah|yep|please|ok|okay|sure|that page|this page|there|that section|this section|it|take me|show me|show me on the site|open it|go there)\b",
            text.lower(),
        )
    )


def context_dependent_navigation_intent(text: str) -> bool:
    lowered = re.sub(r"\s+", " ", text.lower()).strip()
    return bool(
        re.fullmatch(
            r"(?:yes|yeah|yep|please|ok|okay|sure|that page|this page|there|that section|this section|it|open it|go there|take me there|show me there|show me|show me on the site|show it on the site|where is that|where can i see that|can i see that|can i read that|take me to it)",
            lowered,
        )
    )


def navigation_requested(text: str) -> bool:
    return navigation_intent(text)


def is_followup_navigation(text: str) -> bool:
    return followup_navigation_intent(text)


def unique_strings(values: list[Any]) -> list[str]:
    seen: set[str] = set()
    results: list[str] = []
    for value in values:
        text = str(value or "").strip()
        if not text or text in seen:
            continue
        seen.add(text)
        results.append(text)
    return results


def normalize_nav_target(target: dict[str, Any]) -> dict[str, Any] | None:
    url = str(target.get("url") or target.get("route") or "").strip()
    if not url:
        return None

    route = str(target.get("route") or url.split("#", 1)[0] or "/").strip() or "/"
    title = str(target.get("title") or route).strip()
    summary = str(target.get("summary") or target.get("text") or title).strip()
    text = str(target.get("text") or "").strip()
    headings = target.get("headings") if isinstance(target.get("headings"), list) else []
    section_ids = target.get("sectionIds") if isinstance(target.get("sectionIds"), list) else []
    keywords = target.get("keywords") if isinstance(target.get("keywords"), list) else []
    synonyms = target.get("synonyms") if isinstance(target.get("synonyms"), list) else []
    related_routes = target.get("relatedRoutes") if isinstance(target.get("relatedRoutes"), list) else []

    heading_text = " ".join(str(item.get("text", "")) for item in headings if isinstance(item, dict))
    keyword_values = unique_strings(
        [
            *keywords,
            *synonyms,
            title,
            route.replace("/", " ").replace("-", " "),
            url.replace("/", " ").replace("-", " ").replace("#", " "),
            heading_text,
            *section_ids,
        ]
    )

    try:
        priority = int(target.get("priority", 60))
    except (TypeError, ValueError):
        priority = 60

    return {
        "title": title,
        "url": url,
        "route": route,
        "summary": summary[:260],
        "text": text,
        "headings": headings,
        "sectionIds": section_ids,
        "keywords": keyword_values,
        "synonyms": unique_strings(synonyms),
        "priority": max(0, min(100, priority)),
        "relatedRoutes": unique_strings(related_routes),
        "kind": str(target.get("kind", "page")),
    }


def merge_nav_target(base: dict[str, Any], seed: dict[str, Any]) -> dict[str, Any]:
    merged = dict(base)
    merged["keywords"] = unique_strings([*base.get("keywords", []), *seed.get("keywords", [])])
    merged["synonyms"] = unique_strings([*base.get("synonyms", []), *seed.get("synonyms", [])])
    merged["relatedRoutes"] = unique_strings([*base.get("relatedRoutes", []), *seed.get("relatedRoutes", [])])
    if seed.get("title"):
        merged["title"] = seed["title"]
    if seed.get("summary"):
        merged["summary"] = seed["summary"]
    merged["priority"] = max(int(base.get("priority", 60)), int(seed.get("priority", 70)))
    return merged


def build_site_graph(knowledge: dict[str, Any]) -> list[dict[str, Any]]:
    targets_by_url: dict[str, dict[str, Any]] = {}

    for node in knowledge.get("siteGraph", []) or []:
        if not isinstance(node, dict):
            continue
        normalized = normalize_nav_target(node)
        if normalized:
            targets_by_url[normalized["url"]] = normalized

    if not targets_by_url:
        for page in knowledge.get("pages", []) or []:
            if not isinstance(page, dict):
                continue
            normalized = normalize_nav_target(
                {
                    "kind": "page",
                    "route": page.get("route"),
                    "url": page.get("route"),
                    "title": page.get("title"),
                    "summary": str(page.get("text", ""))[:180],
                    "text": page.get("text", ""),
                    "priority": 60,
                }
            )
            if normalized:
                targets_by_url[normalized["url"]] = normalized

    for seed in NAV_TARGETS:
        normalized_seed = normalize_nav_target(
            {
                **seed,
                "route": str(seed["url"]).split("#", 1)[0] or "/",
                "priority": 85,
            }
        )
        if not normalized_seed:
            continue
        current = targets_by_url.get(normalized_seed["url"])
        if current:
            targets_by_url[normalized_seed["url"]] = merge_nav_target(current, normalized_seed)
        else:
            targets_by_url[normalized_seed["url"]] = normalized_seed

    return list(targets_by_url.values())


def cached_site_graph(knowledge: dict[str, Any]) -> list[dict[str, Any]]:
    mtime = knowledge_mtime()
    if SITE_GRAPH_CACHE.get("mtime") == mtime and SITE_GRAPH_CACHE.get("targets") is not None:
        return SITE_GRAPH_CACHE["targets"]

    targets = build_site_graph(knowledge)
    SITE_GRAPH_CACHE["mtime"] = mtime
    SITE_GRAPH_CACHE["targets"] = targets
    return targets


def recent_context_for_navigation(messages: list[ChatMessage]) -> str:
    snippets: list[str] = []
    seen_latest_user = False

    for message in reversed(messages):
        content = message.content.strip()
        if not content:
            continue
        if message.role == "user" and not seen_latest_user:
            seen_latest_user = True
            continue
        if message.role in {"user", "assistant"}:
            snippets.append(content[:500])
        if len(snippets) >= 3:
            break

    return "\n".join(reversed(snippets))


def score_navigation(query_text: str, graph: list[dict[str, Any]], matches: list[KnowledgePage]) -> list[tuple[int, dict[str, Any]]]:
    query_tokens = tokenize(query_text)
    if not query_tokens:
        return []

    lowered_query = query_text.lower()
    route_mentions = [match.group(0) for match in re.finditer(r"/[a-z0-9#/_-]+", lowered_query)]
    matched_routes = {page.route for page in matches}
    scored: list[tuple[int, dict[str, Any]]] = []

    for target in graph:
        title = str(target.get("title", ""))
        url = str(target.get("url", ""))
        route = str(target.get("route") or url.split("#", 1)[0] or "/")
        summary = str(target.get("summary", ""))
        text = str(target.get("text", ""))
        kind = str(target.get("kind", "page"))
        keywords = [str(item) for item in target.get("keywords", [])]
        synonyms = [str(item) for item in target.get("synonyms", [])]
        headings = target.get("headings", [])
        heading_text = " ".join(str(item.get("text", "")) for item in headings if isinstance(item, dict))

        keyword_tokens = phrase_tokens(keywords + synonyms)
        title_tokens = tokenize(f"{title} {url} {route} {heading_text}")
        text_tokens = tokenize(f"{summary} {text[:2400]}")

        score = 0
        score += len(query_tokens & title_tokens) * 9
        score += len(query_tokens & keyword_tokens) * 7
        score += min(len(query_tokens & text_tokens), 8) * 2
        if kind == "semantic-block":
            score += min(len(query_tokens & text_tokens), 10) * 4
            score += min(len(query_tokens & title_tokens), 5) * 4

        title_lower = title.lower()
        if title_lower and title_lower in lowered_query:
            score += 35

        for phrase in keywords + synonyms:
            phrase_lower = phrase.lower().strip()
            if len(phrase_lower) >= 4 and phrase_lower in lowered_query:
                score += 16

        if route in matched_routes:
            score += 10

        if route and route != "/":
            route_index = lowered_query.find(route.lower())
            if route_index >= 0:
                score += max(80, 320 - route_index)

            for index, mention in enumerate(route_mentions):
                if mention == route.lower() or mention == url.lower():
                    score += max(45, 180 - (index * 45))
                    break

        if url and "#" in url:
            fragment = url.split("#", 1)[1].replace("-", " ")
            if fragment and fragment in lowered_query:
                score += 32
            if kind == "semantic-block":
                score += 6

        if route == "/glossary" and not re.search(r"\b(glossary|term|terms|meaning|define|definition|jargon)\b", lowered_query):
            score -= 25
        if route == "/glossary" and re.search(r"\b(glossary|term|terms|meaning|define|definition|jargon|what does .+ mean)\b", lowered_query):
            score += 75
        if route == "/glossary" and re.search(r"\b(executor|beneficiary|beneficiaries|trustee|probate|intestacy|rules of intestacy)\b", lowered_query):
            score += 40
        if kind == "semantic-block" and route == "/glossary" and re.search(r"\b(what does .+ mean|define .+|meaning of .+)\b", lowered_query):
            score += 30
        if route == "/extended-services" and re.search(r"\b(probate|grant of probate|estate administration)\b", lowered_query):
            score += 55
        if route == "/inheritance-tax-planning" and re.search(r"\b(tax|iht|inheritance tax|mitigating tax|tax exposure)\b", lowered_query):
            score += 55
        if route == "/contact" and re.search(r"\b(contact|call|call me|email|book|appointment|speak|talk to someone|sensitive details|evening call)\b", lowered_query):
            score += 45
        if route == "/contact" and re.search(r"\b(book|appointment|consultation|enquiry|get in touch)\b", lowered_query) and not re.search(r"\b(phone|phone number|email|details|form)\b", lowered_query):
            score += 35 if kind == "page" else -25
        if url == "/contact#contact-details" and re.search(r"\b(phone|phone number|email|contact details|call)\b", lowered_query):
            score += 55
        if route == "/trusts" and re.search(r"\b(trust|trusts|trustee|beneficiary|beneficiaries|second marriage|blended family|previous marriage|first marriage|life interest|protect(?:ing)? (?:the )?(?:house|home|property|assets)|property protection)\b", lowered_query):
            score += 70
        if route == "/trusts" and re.search(r"\b(second marriage|blended family|previous marriage|first marriage|life interest)\b", lowered_query):
            score += 55
        if route == "/lpa" and re.search(r"\b(lpa|lpas|lasting power|power of attorney|mum|dad|mother|father|parent|capacity|memory problems|dementia|make decisions|health decisions|financial decisions)\b", lowered_query):
            score += 75
        if route == "/lpa" and re.search(r"\b(more info|read about|show me|take me)\b", lowered_query) and re.search(r"\b(lpa|lpas|lasting power|power of attorney)\b", lowered_query):
            score += 35 if kind == "page" else -25
        if route == "/care-planning" and re.search(r"\b(care costs?|care fees?|care home|care home fees|funding care|paying for care|later-?life care|elderly parent|mum care|dad care)\b", lowered_query):
            score += 75
        if route == "/asset-protection" and re.search(r"\b(protect(?:ing)? (?:the )?(?:house|home|property|assets)|asset protection|family assets|care costs?|care fees?)\b", lowered_query):
            score += 25
        if "/#review-" in url and not re.search(r"\b(review|reviews|testimonial|testimonials|feedback|clients say)\b", lowered_query):
            score -= 80
        if route == "/business-protection" and re.search(r"\b(business owner|business succession|shareholder|director|company)\b", lowered_query):
            score += 45
        if route == "/agricultural-land" and re.search(r"\b(farm|farming|farmer|agricultural|rural estate|agricultural land)\b", lowered_query):
            score += 45
        if url == "/#services" and re.search(r"\b(services|what do you offer|what can you help|range of services)\b", lowered_query):
            score += 45
        if url.startswith("/#service-") and not re.search(r"\b(services|what do you offer|what can you help|range of services)\b", lowered_query):
            score -= 45
        if url == "/#reviews" and re.search(r"\b(review|reviews|testimonial|testimonials|feedback|clients say)\b", lowered_query):
            score += 45
        if url == "/#where-we-work" and re.search(r"\b(home visits|leamington|warwickshire|where.*work|location|office|local)\b", lowered_query):
            score += 45
        if url == "/#newsletter" and re.search(r"\b(newsletter|celebrity|fun facts|updates|guides)\b", lowered_query):
            score += 45
        if url == "/#faq" and not re.search(r"\b(faq|question|questions|common questions|answers)\b", lowered_query):
            score -= 45
        if url == "/#faq-what-s-the-difference-between-a-will-and-a-trust" and re.search(r"\b(difference|different)\b", lowered_query) and "will" in query_tokens and "trust" in query_tokens:
            score += 130
        if url == "/#problem-care-costs-that-quietly-erode-everything-you-ve-built" and re.search(r"\b(care costs?|care fees?|erod(?:e|ing)|everything.*built|built)\b", lowered_query):
            score += 135
        if url == "/#contact" and not re.search(r"\b(home|homepage|section|bottom)\b", lowered_query):
            score -= 45

        if score:
            score += int(target.get("priority", 60)) // 12
            scored.append((score, target))

    deduped: dict[str, tuple[int, dict[str, Any]]] = {}
    for score, target in scored:
        key = str(target.get("url", ""))
        current = deduped.get(key)
        if current is None or score > current[0]:
            deduped[key] = (score, target)

    return sorted(deduped.values(), key=lambda item: item[0], reverse=True)


def infer_navigation(user_text: str, matches: list[KnowledgePage], knowledge: dict[str, Any], context_text: str = "") -> dict[str, Any] | None:
    query_text = user_text
    display_query = user_text
    is_context_followup = bool(
        context_text
        and (
            (is_followup_navigation(user_text) and not navigation_requested(user_text))
            or context_dependent_navigation_intent(user_text)
        )
    )
    if is_context_followup:
        query_text = f"{context_text}\n{user_text}"
        display_query = context_text

    scored = score_navigation(query_text, cached_site_graph(knowledge), matches)
    if not scored:
        return None

    targets = [
        {
            "title": str(target["title"]),
            "url": str(target["url"]),
            "summary": str(target["summary"]),
            "score": score,
        }
        for score, target in scored[:3]
    ]

    if not targets or targets[0]["score"] < 8:
        return None

    second_score = targets[1]["score"] if len(targets) > 1 else 0
    has_route_reference = bool(re.search(r"/[a-z0-9#/_-]+", query_text.lower()))
    first_route = str(scored[0][1].get("route", "")) if scored else ""
    second_route = str(scored[1][1].get("route", "")) if len(scored) > 1 else ""
    first_kind = str(scored[0][1].get("kind", "")) if scored else ""
    same_route_cluster = bool(first_route and first_route == second_route and targets[0]["score"] >= 55)
    precise_block_match = bool(first_kind == "semantic-block" and targets[0]["score"] >= 135)
    confident = (
        has_route_reference
        or precise_block_match
        or same_route_cluster
        or second_score == 0
        or targets[0]["score"] >= max(18, int(second_score * 1.22))
        or (targets[0]["score"] >= 45 and targets[0]["score"] - second_score >= 12)
    )
    requested = navigation_requested(user_text) or is_context_followup

    return {
        "type": "semantic-navigation",
        "auto": bool(requested and confident),
        "targets": targets,
        "query": str(targets[0]["title"] if is_context_followup else display_query)[:500],
    }


def latest_user_message(messages: list[ChatMessage]) -> str:
    for message in reversed(messages):
        if message.role == "user" and message.content.strip():
            return message.content.strip()
    return ""


def previous_assistant_message(messages: list[ChatMessage]) -> str:
    seen_latest_user = False
    for message in reversed(messages):
        content = message.content.strip()
        if not content:
            continue
        if message.role == "user" and not seen_latest_user:
            seen_latest_user = True
            continue
        if message.role == "assistant":
            return content
    return ""


def contextual_clarification_reference(user_text: str) -> str:
    lowered = re.sub(r"\s+", " ", user_text.lower()).strip().rstrip("?")
    match = re.fullmatch(r"what (?:can|could|would|might|is|was|were|are) (?:be )?(.+)", lowered)
    if match:
        return match.group(1).strip()
    if re.fullmatch(r"what do you mean(?: by that)?", lowered):
        return "that"
    return ""


def answer_contextual_clarification(user_text: str, messages: list[ChatMessage]) -> str | None:
    reference = contextual_clarification_reference(user_text)
    if not reference:
        return None

    previous = previous_assistant_message(messages)
    if not previous:
        return None

    sentences = re.split(r"(?<=[.!?])\s+", re.sub(r"\s+", " ", previous).strip())
    reference_tokens = tokenize(reference)
    candidates: list[tuple[int, str]] = []
    for sentence in sentences:
        clean_sentence = sentence.strip()
        if len(clean_sentence) < 24:
            continue
        sentence_tokens = tokenize(clean_sentence)
        score = len(reference_tokens & sentence_tokens)
        if reference in clean_sentence.lower():
            score += 5
        if score:
            candidates.append((score, clean_sentence))

    if not candidates:
        return None

    candidates.sort(key=lambda item: item[0], reverse=True)
    sentence = candidates[0][1]

    if re.search(r"\bupsetting\b", reference, re.I) and re.search(r"\bdelays?\b", sentence, re.I):
        return (
            "In that context, the upsetting part is the delay itself: family may be trying to sort out money, property, bills, or practical decisions while also dealing with a difficult moment.\n\n"
            "Clear estate planning can reduce some of that uncertainty by making wishes, decision-makers, and key documents easier to understand and act on.\n\n"
            "This is general information, not personal legal or financial advice."
        )

    return (
        f"I meant this part: {sentence}\n\n"
        "In plain English, it is about reducing uncertainty for the people who may have to deal with practical decisions later.\n\n"
        "This is general information, not personal legal or financial advice."
    )


def answer_text_for_navigation_followup(
    user_text: str,
    navigation: dict[str, Any] | None,
    context_text: str,
) -> str:
    if not navigation or not navigation.get("auto") or not context_text:
        return user_text
    if not context_dependent_navigation_intent(user_text):
        return user_text

    query = str(navigation.get("query") or "").strip()
    targets = navigation.get("targets") or []
    target_title = str(targets[0].get("title") or "").strip() if targets else ""

    resolved_topic = query or target_title
    if not resolved_topic:
        return user_text

    return resolved_topic


def is_greeting(text: str) -> bool:
    normalized = re.sub(r"[^a-z\s]", " ", text.lower()).strip()
    return normalized in {"hi", "hello", "hey", "hiya", "good morning", "good afternoon", "good evening"}


def asks_capability(text: str) -> bool:
    return bool(
        re.search(
            r"\b(what can you do|how can you help|help me|can you help|what should i ask)\b",
            text.lower(),
        )
    )


def is_handoff_request(text: str) -> bool:
    return bool(
        re.search(
            r"\b(book|callback|call me|contact me|speak|appointment|consultation|human|adviser|advisor|email me|phone me)\b",
            text.lower(),
        )
    )


def is_high_risk(text: str) -> bool:
    return bool(
        re.search(
            r"\b(guarantee|definitely|avoid all tax|hide assets|court dispute|safeguarding|abuse|deadline|lawsuit|sue|urgent|complex estate|farm|agricultural|complex business|business dispute|shareholder dispute)\b",
            text.lower(),
        )
    )


def asks_for_fee_or_timeframe(text: str) -> bool:
    return bool(
        re.search(
            r"\b(cost|fee|price|how much|timeframe|how long|weeks|days|package|bundle|bundled|batch|cheaper|discount)\b",
            text.lower(),
        )
    )


def is_out_of_scope(text: str) -> bool:
    return bool(
        re.search(
            r"\b(boiler|plumb(?:er|ing)?|electrician|roof|car|mot|insurance claim|mortgage broker|conveyancing|divorce|criminal|employment tribunal)\b",
            text.lower(),
        )
    )


def extract_contact(text: str) -> dict[str, str]:
    email = re.search(r"[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}", text)
    phone = re.search(r"(?:\+44\s?|0)(?:\d[\s-]?){9,10}", text)
    name = re.search(
        r"(?:my name is|i am|i'm)\s+([a-z]+(?:\s+(?!and\b|my\b|email\b|phone\b|number\b|tel\b|telephone\b)[a-z]+)?)(?=\s+(?:and|my|email|phone|number|tel|telephone)\b|[,.]|$)",
        text,
        re.IGNORECASE,
    )
    return {
        "email": email.group(0) if email else "",
        "phone": phone.group(0).strip() if phone else "",
        "name": name.group(1) if name else "",
    }


def split_name(name: str) -> dict[str, str]:
    parts = [part for part in name.strip().split() if part]
    return {
        "firstName": parts[0] if parts else "",
        "lastName": " ".join(parts[1:]),
    }


def nested_id(payload: dict[str, Any], key: str) -> str | None:
    data = payload.get("data")
    if isinstance(data, dict):
        keyed = data.get(key)
        if isinstance(keyed, dict) and isinstance(keyed.get("id"), str):
            return keyed["id"]
        if isinstance(data.get("id"), str):
            return data["id"]
    if isinstance(payload.get("id"), str):
        return payload["id"]
    return None


def create_twenty_person(contact: dict[str, str], message: str, page_url: str, chat_id: str) -> dict[str, Any]:
    if not TWENTY_API_TOKEN:
        return {"status": "skipped", "reason": "TWENTY_API_TOKEN is not set"}

    name = contact.get("name") or "Website chat enquiry"
    body: dict[str, Any] = {
        "name": split_name(name),
    }
    if contact.get("email"):
        body["emails"] = {"primaryEmail": contact["email"]}
    if contact.get("phone"):
        body["phones"] = {
            "primaryPhoneNumber": contact["phone"],
            "primaryPhoneCountryCode": "GB",
            "primaryPhoneCallingCode": "+44",
        }

    request = urllib.request.Request(
        f"{TWENTY_BASE_URL}/rest/people",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {TWENTY_API_TOKEN}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=8) as response:
            payload = json.loads(response.read().decode("utf-8") or "{}")
            person_id = nested_id(payload, "createPerson")
            note_id = create_twenty_note(person_id, message, page_url, chat_id) if person_id else None
            return {"status": "created", "personId": person_id, "noteId": note_id}
    except urllib.error.HTTPError as error:
        reason = error.read().decode("utf-8", errors="replace")[:240]
        return {"status": "failed", "reason": f"Twenty returned {error.code}: {reason}"}
    except Exception as error:
        return {"status": "failed", "reason": error.__class__.__name__}


def create_twenty_note(person_id: str, message: str, page_url: str, chat_id: str) -> str | None:
    if not TWENTY_API_TOKEN or not message:
        return None

    note_body = {
        "title": "Assistant handoff",
        "bodyV2": {
            "markdown": "\n".join(
                item
                for item in [
                    "Source: assistant_handoff",
                    f"Page: {page_url}" if page_url else "",
                    f"Chat: {chat_id}" if chat_id else "",
                    "",
                    message,
                ]
                if item
            ),
            "blocknote": "",
        },
    }
    note_request = urllib.request.Request(
        f"{TWENTY_BASE_URL}/rest/notes",
        data=json.dumps(note_body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {TWENTY_API_TOKEN}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(note_request, timeout=8) as response:
            payload = json.loads(response.read().decode("utf-8") or "{}")
            note_id = nested_id(payload, "createNote")
    except Exception:
        return None

    if not note_id:
        return None

    target_body = {"noteId": note_id, "targetPersonId": person_id}
    target_request = urllib.request.Request(
        f"{TWENTY_BASE_URL}/rest/noteTargets",
        data=json.dumps(target_body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {TWENTY_API_TOKEN}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        urllib.request.urlopen(target_request, timeout=8).close()
    except Exception:
        pass

    return note_id


def write_handoff(request: ChatRequest, user_text: str, response_text: str) -> dict[str, Any]:
    contact = extract_contact(user_text)
    if not contact.get("email") and not contact.get("phone"):
        return {
            "status": "needs_details",
            "contact": contact,
            "required": ["name", "email or phone"],
        }

    LEADS_PATH.parent.mkdir(parents=True, exist_ok=True)
    page_url = str(request.metadata.get("pageUrl", ""))
    chat_id = request.id or ""
    crm = create_twenty_person(contact, user_text, page_url, chat_id)
    record = {
        "id": f"lead_{uuid.uuid4().hex[:12]}",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "chatId": chat_id,
        "pageUrl": page_url,
        "intent": "human_handoff",
        "contact": contact,
        "latestMessage": user_text,
        "conversationSummary": response_text[:700],
        "crm": crm,
    }
    with LEADS_PATH.open("a", encoding="utf-8") as file:
        file.write(json.dumps(record) + "\n")
    return record


def service_links(pages: list[KnowledgePage]) -> str:
    if not pages:
        return ""
    links = []
    for page in pages[:3]:
        if page.route:
            links.append(f"- {page.title or page.route}: {page.route}")
    return "\n\nHelpful pages:\n" + "\n".join(links) if links else ""


def curated_topic(user_text: str, pages: list[KnowledgePage]) -> dict[str, Any] | None:
    lowered = user_text.lower()
    scored: list[tuple[int, str, dict[str, Any]]] = []

    for key, topic in CURATED_TOPICS.items():
        trigger_score = sum(1 for trigger in topic["triggers"] if trigger in lowered)
        route_score = sum(1 for page in pages if page.route in topic["routes"])
        score = trigger_score * 5 + route_score
        if score:
            scored.append((score, key, topic))

    if not scored:
        return None

    scored.sort(key=lambda item: item[0], reverse=True)
    return scored[0][2]


def links_for_routes(routes: list[str], knowledge: dict[str, Any]) -> str:
    targets = []
    graph = cached_site_graph(knowledge)
    for route in routes:
        target = next((item for item in graph if str(item["url"]).split("#", 1)[0] == route), None)
        if target and target["url"] not in {item["url"] for item in targets}:
            targets.append(target)

    if not targets:
        return ""

    return "\n\nUseful places on the site:\n" + "\n".join(
        f"- {target['title']}: {target['url']}" for target in targets[:3]
    )


def model_available() -> bool:
    return MODEL_PROVIDER == "openai" and bool(os.environ.get("OPENAI_API_KEY")) and bool(MODEL_ID)


def page_context(pages: list[KnowledgePage]) -> str:
    blocks = []
    for page in pages[:3]:
        text = re.sub(r"\b(Book initial chat|Start with an initial chat|Call 07902 863999)\b", " ", page.text)
        text = re.sub(r"\s+", " ", text).strip()[:900]
        blocks.append(f"TITLE: {page.title}\nROUTE: {page.route}\nCONTENT: {text}")
    return "\n\n---\n\n".join(blocks)


def should_use_model(user_text: str, pages: list[KnowledgePage]) -> bool:
    if MODEL_TOOL_POLICY == "tools_only":
        return False
    if not model_available():
        return False
    return True


def needs_governed_parlant(
    user_text: str,
    messages: list[ChatMessage],
    navigation: dict[str, Any] | None = None,
) -> tuple[bool, str]:
    lowered = user_text.lower()
    if not user_text.strip():
        return False, "empty"
    if is_greeting(user_text):
        return False, "greeting"
    if is_handoff_request(user_text):
        return True, "handoff"
    if is_high_risk(user_text) or asks_for_fee_or_timeframe(user_text):
        return True, "guardrail"
    if any(
        re.search(pattern, lowered)
        for pattern in [
            r"\b(should i|do i need|what should i|would i need|is it right for me|best option|recommend|recommendation)\b",
            r"\b(avoid tax|reduce tax|inheritance tax|iht|tax planning|care fees?|care costs?|care funding)\b",
            r"\b(legal advice|financial advice|probate advice|eligibility|eligible|entitled|capacity|mental capacity)\b",
            r"\b(put my house|protect my house|protect my home|protect my assets|second marriage|blended family)\b",
        ]
    ):
        return True, "sensitive_intent"
    if asks_capability(user_text):
        return False, "capability"
    if navigation and navigation.get("auto"):
        return False, "navigation"
    if any(
        message.role == "assistant"
        and re.search(r"\b(handoff|book|appointment|consultation|contact details|speak directly)\b", message.content.lower())
        for message in messages[-4:]
    ):
        return True, "journey"
    return False, "fast_path"


def should_return_fast_draft(route_reason: str, user_text: str, navigation: dict[str, Any] | None) -> bool:
    if route_reason in {"empty", "greeting", "capability", "navigation"}:
        return True
    if is_out_of_scope(user_text):
        return True
    if navigation and navigation.get("auto") and not re.search(r"\b(explain|tell me|what is|how does|why)\b", user_text.lower()):
        return True
    return False


def openai_answer_sync(
    user_text: str,
    messages: list[ChatMessage],
    pages: list[KnowledgePage],
    draft_answer: str,
    navigation: dict[str, Any] | None,
) -> str:
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    recent_messages = [
        {"role": message.role, "content": message.content}
        for message in messages[-6:]
        if message.role in {"user", "assistant"} and message.content
    ]
    nav_context = json.dumps(navigation.get("targets", [])[:3] if navigation else [], ensure_ascii=False)

    instructions = (
        "You are the Pathway Estate Planning website assistant. Write warm, plain-English answers for people in England and Wales. "
        "Use only the supplied website context, guardrail draft, and navigation targets. Do not invent fees, timeframes, tax savings, legal outcomes, eligibility, or availability. "
        "Never provide definitive legal, tax, financial, probate, or care-funding advice. Do not ask for sensitive personal details. "
        "If the user needs personal advice, suggest speaking with Pathway. Keep answers concise and human, usually 120-180 words. "
        "Format every answer as simple Markdown for a small chat bubble: use short paragraphs separated by blank lines. "
        "Do not turn the whole answer into a list. Start with one or two natural paragraphs. "
        "Use bullets only for grouped options, steps, useful pages, or contact details after an introductory line. "
        "When you do use a list, every list item must start with '- ' on its own line. "
        "Do not use nested lists. Do not make a list heading itself a bullet. "
        "Do not write list-like items as plain lines without '- '. For contact details, put phone and email on separate bullet lines. "
        "Avoid dense single-paragraph answers. "
        "If the guardrail draft contains a useful/helpful pages section, include it at most once, keep the exact route URLs from the draft, and do not add any other page recommendation list or page-summary bullets. "
        "Do not add parenthetical meta-comments about what the assistant can do. "
        "Use any non-sensitive personal context the user volunteers, such as age, family role, business ownership, children, property, or where they are in the process. "
        "Make the answer feel specific to that context without asking for sensitive details or pretending to give personal legal advice. "
        "Do not add phone or email placeholders. Only include contact details if the supplied context includes the actual values. "
        "Refer to the business as Pathway, not 'we' or 'us'. "
        "For greetings or small talk, respond naturally and briefly, then offer useful directions. "
        "Treat the guardrail draft as safety guidance and allowed facts, not a script. You may rewrite it substantially as long as the meaning and safety boundaries remain. "
        "Do not include URLs unless they appear in the supplied navigation targets. Avoid repeating 'Pathway can help in plain English' as a formula."
    )
    prompt = (
        f"User message:\n{user_text}\n\n"
        f"Recent conversation:\n{json.dumps(recent_messages, ensure_ascii=False)}\n\n"
        f"Guardrail draft and allowed facts:\n{draft_answer}\n\n"
        f"Website context, if any:\n{page_context(pages) or 'No matching page context. Stay general and guide the user back to Pathway topics.'}\n\n"
        f"Navigation targets:\n{nav_context}\n\n"
        "Return only the answer text."
    )

    response = client.responses.create(
        model=MODEL_ID,
        instructions=instructions,
        input=prompt,
        max_output_tokens=800,
        reasoning={"effort": "minimal"},
        store=False,
    )
    answer = getattr(response, "output_text", "") or ""
    return re.sub(r"\s+\n", "\n", answer).strip()


def format_for_chat_bubble(text: str) -> str:
    text = re.sub(r"[ \t]+", " ", text).strip()
    text = re.sub(r"\n{3,}", "\n\n", text)
    if not text:
        return text

    text = re.sub(r"\n*\s*Phone:\s*\n?\s*Email:\s*", "\n\n", text)
    text = re.sub(r"\n*\s*Phone:\s*$", "", text)
    text = re.sub(r"\n*\s*Email:\s*$", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    text = normalize_plain_list_lines(text)
    text = normalize_markdown_spacing(text)

    phone_match = re.search(r"0\d(?:[\s-]?\d){8,12}", text)
    email_match = re.search(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", text)
    if phone_match and email_match and "I do not have enough information" not in text:
        intro = re.split(r"\bPhone\b|\bEmail\b", text, maxsplit=1)[0]
        intro = re.sub(r"[:\s-]+$", "", intro).strip()
        if not intro or len(intro) > 140:
            intro = "Here are Pathway's contact details"
        remainder = text[email_match.end():].strip()
        remainder = re.sub(r"^[.:\s-]+", "", remainder)
        lines = [
            f"{intro}:",
            "",
            f"- Phone: {phone_match.group(0).strip()}",
            f"- Email: {email_match.group(0).strip()}",
        ]
        if remainder:
            lines.extend(["", remainder])
        return "\n".join(lines).strip()

    text = re.sub(r"\bPhone:\s*", "Phone: ", text)
    text = re.sub(r"\bEmail:\s*", "Email: ", text)
    text = re.sub(r":\s*[-*]\s*(Phone: )", r":\n\n\1", text)
    text = re.sub(r"\s+[-*]\s+(Phone: )", r"\n\n\1", text)
    text = re.sub(r"\s+[-*]\s+(Email: )", r"\n\1", text)
    text = re.sub(r"\s+(Phone: )", r"\n\n\1", text)
    text = re.sub(r"\s+(Email: )", r"\n\1", text)
    text = re.sub(r"(\S+@\S+)\s+(You can|Pathway offers|If you|For safety)", r"\1\n\n\2", text)

    if "\n" in text or len(text) < 220:
        return text.strip()

    sentences = re.split(r"(?<=[.!?])\s+", text)
    if len(sentences) < 3:
        return text

    paragraphs: list[str] = []
    current: list[str] = []
    for sentence in sentences:
        current.append(sentence)
        paragraph = " ".join(current)
        if len(current) >= 2 or len(paragraph) > 180:
            paragraphs.append(paragraph)
            current = []

    if current:
        paragraphs.append(" ".join(current))

    return "\n\n".join(paragraphs).strip()


def normalize_plain_list_lines(text: str) -> str:
    lines = text.split("\n")
    normalized: list[str] = []
    in_list_after_colon = False
    plain_items = 0

    def is_plain_list_item(line: str) -> bool:
        stripped = line.strip()
        if not stripped or stripped.startswith(("-", "*", "1.")):
            return False
        if len(stripped) > 92:
            return False
        if re.search(r"[.!?]$", stripped):
            return False
        return bool(re.search(r"[A-Za-z]", stripped))

    for line in lines:
        stripped = line.strip()
        if not stripped:
            normalized.append(line)
            continue

        if in_list_after_colon and is_plain_list_item(line):
            normalized.append(f"- {stripped}")
            plain_items += 1
            continue

        if in_list_after_colon and (stripped.startswith(("-", "*")) or plain_items >= 2):
            in_list_after_colon = stripped.startswith(("-", "*"))
        else:
            in_list_after_colon = False

        normalized.append(line)
        if stripped.endswith(":"):
            in_list_after_colon = True
            plain_items = 0

    return "\n".join(normalized)


def normalize_markdown_spacing(text: str) -> str:
    lines = [line.strip() for line in text.split("\n")]
    spaced: list[str] = []
    previous_kind = "blank"

    for line in lines:
        if not line:
            if spaced and spaced[-1] != "":
                spaced.append("")
            previous_kind = "blank"
            continue

        is_list = bool(re.match(r"^[-*]\s+", line))
        kind = "list" if is_list else "paragraph"

        if spaced and spaced[-1] != "":
            if kind == "paragraph" and previous_kind in {"paragraph", "list"}:
                spaced.append("")
            elif kind == "list" and previous_kind == "paragraph":
                spaced.append("")

        spaced.append(line)
        previous_kind = kind

    return "\n".join(spaced).strip()


async def maybe_model_answer(
    request: ChatRequest,
    user_text: str,
    messages: list[ChatMessage],
    pages: list[KnowledgePage],
    draft_answer: str,
    navigation: dict[str, Any] | None,
    disabled: bool = False,
) -> tuple[str, dict[str, Any]]:
    metadata = {
        "provider": MODEL_PROVIDER or "none",
        "id": MODEL_ID,
        "toolPolicy": MODEL_TOOL_POLICY,
        "configured": model_available(),
        "used": False,
    }
    if disabled:
        metadata["disabled"] = True
        return draft_answer, metadata

    use_parlant, route_reason = needs_governed_parlant(user_text, messages, navigation)
    metadata["route"] = "parlant" if use_parlant else "fast"
    metadata["routeReason"] = route_reason
    native_metadata: dict[str, Any] = {
        "provider": "parlant",
        "id": PARLANT_AGENT_ID,
        "configured": native_parlant_enabled(),
        "used": False,
        "skipped": not use_parlant,
        "routeReason": route_reason,
    }

    if use_parlant:
        native_answer, native_metadata = await native_parlant_answer(request, user_text, draft_answer)
        native_metadata["route"] = "parlant"
        native_metadata["routeReason"] = route_reason
        if native_metadata.get("used"):
            native_metadata["fallbackProvider"] = metadata
            return native_answer, native_metadata

    if should_return_fast_draft(route_reason, user_text, navigation):
        if native_metadata.get("configured"):
            metadata["nativeFallback"] = native_metadata
        metadata["used"] = False
        metadata["draftOnly"] = True
        if navigation and navigation.get("auto") and navigation.get("targets"):
            target = navigation["targets"][0]
            return f"I found the closest place on the site: {target['title']}.", metadata
        return draft_answer, metadata

    if not should_use_model(user_text, pages):
        if native_metadata.get("configured"):
            metadata["nativeFallback"] = native_metadata
        return draft_answer, metadata

    try:
        answer = await asyncio.to_thread(openai_answer_sync, user_text, messages, pages, draft_answer, navigation)
    except Exception as error:
        metadata["error"] = error.__class__.__name__
        metadata["nativeFallback"] = native_metadata
        return draft_answer, metadata

    if not answer:
        metadata["error"] = "EmptyModelResponse"
        metadata["nativeFallback"] = native_metadata
        return draft_answer, metadata

    metadata["used"] = True
    metadata["nativeFallback"] = native_metadata
    return answer, metadata


def answer_from_guardrails(user_text: str, pages: list[KnowledgePage], knowledge: dict[str, Any]) -> str:
    contact = knowledge.get("contact", {})
    phone = contact.get("phone", "07902 863999")
    email = contact.get("email", "info@pathwayestateplanning.co.uk")

    if not user_text:
        return (
            "Tell me what is on your mind and I will point you to the clearest starting place. "
            "I can explain the basics, find the right page, or help you arrange a conversation with Pathway."
        )

    if is_greeting(user_text):
        return (
            "Hi, I can help you find the right starting point for estate planning. "
            "You can ask about Wills, Trusts, LPAs, inheritance tax planning, care planning, or simply say what you are trying to sort out."
        )

    if asks_capability(user_text):
        return (
            "I can explain the basics, find the right page on the site, or help you arrange a conversation with Pathway. "
            "A good starting point is to tell me what prompted you to think about estate planning today."
        )

    if asks_for_fee_or_timeframe(user_text):
        return (
            "Pathway can talk through Wills, Trusts, and wider estate planning together, but chat cannot confirm bundled pricing, discounts, or fixed costs.\n\n"
            "The right scope depends on the documents needed, the family situation, and how much planning is involved.\n\n"
            "A sensible next step is to ask Pathway to look at the Will and Trust question together, then explain the options and costs clearly before any work starts."
        )

    if is_high_risk(user_text):
        return (
            "That sounds like something where a general chat answer would not be enough. I can explain the broad "
            "Pathway services, but for urgent deadlines, disputes, safeguarding concerns, complex tax, business, "
            "or land questions, please speak directly with Pathway so they can understand the details safely."
        )

    if is_out_of_scope(user_text):
        return (
            "I do not have enough information in the Pathway knowledgebase to answer that confidently.\n\n"
            "Pathway's website focuses on estate planning, Wills, Trusts, LPAs, inheritance tax planning, care planning, and related family planning questions.\n\n"
            f"If your question is about estate planning, the best next step is to speak with Pathway directly on {phone} or email {email}."
        )

    if not pages:
        return (
            "I do not have enough information in the Pathway knowledgebase to answer that confidently. "
            f"The best next step is to speak with Pathway directly on {phone} or email {email}."
        )

    topic = curated_topic(user_text, pages)
    if topic:
        return f"{topic['answer']}\n\nThis is general information, not personal advice.{links_for_routes(topic['routes'], knowledge)}"

    source = pages[0]
    text = re.sub(r"\b(Book initial chat|Start with an initial chat|Call 07902 863999)\b", " ", source.text)
    text = re.sub(r"\s+", " ", text).strip()[:1200]
    sentences = re.split(r"(?<=[.!?])\s+", text)
    useful = [sentence for sentence in sentences if len(sentence) > 45][:4]
    if not useful:
        useful = [text[:450]]

    answer = " ".join(useful)
    answer = re.sub(r"\s+", " ", answer).strip()
    return (
        f"Broadly, Pathway can help with this in plain English and without pressure. {answer}\n\n"
        "This is general information rather than legal, tax, or financial advice. "
        "If you want to apply it to your own circumstances, it is best to arrange a conversation with Pathway."
        f"{service_links(pages)}"
    )


app = FastAPI(title="Pathway Parlant Estate Service")


@app.on_event("startup")
async def startup_native_parlant() -> None:
    if not native_parlant_enabled():
        PARLANT_NATIVE_STATE["status"] = "disabled"
        return
    task = asyncio.create_task(run_native_parlant_sidecar())
    PARLANT_NATIVE_STATE["task"] = task


@app.on_event("shutdown")
async def shutdown_native_parlant() -> None:
    task = PARLANT_NATIVE_STATE.get("task")
    if isinstance(task, asyncio.Task) and not task.done():
        task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await task


@app.get("/health")
async def health() -> dict[str, Any]:
    knowledge = load_knowledge()
    return {
        "status": "healthy",
        "knowledgePath": str(KNOWLEDGE_PATH),
        "knowledgeLoaded": KNOWLEDGE_PATH.exists(),
        "siteGraphTargets": len(cached_site_graph(knowledge)),
        "parlantSdkImportable": parlant_sdk is not None,
        "modelProvider": MODEL_PROVIDER or "none",
        "modelId": MODEL_ID,
        "modelToolPolicy": MODEL_TOOL_POLICY,
        "modelConfigured": model_available(),
        "parlantNlpService": PARLANT_NLP_SERVICE,
        "parlantOpenaiSchematicModel": PARLANT_OPENAI_SCHEMATIC_MODEL,
        "emcieModelTier": EMCIE_MODEL_TIER or "default",
        "nativeParlant": {
            "enabled": native_parlant_enabled(),
            "status": PARLANT_NATIVE_STATE.get("status"),
            "agentId": PARLANT_NATIVE_STATE.get("agentId"),
            "baseUrl": PARLANT_NATIVE_STATE.get("baseUrl"),
            "bootstrap": PARLANT_NATIVE_STATE.get("bootstrap"),
            "error": PARLANT_NATIVE_STATE.get("error"),
        },
        "time": time.time(),
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> JSONResponse:
    knowledge = load_knowledge()
    user_text = latest_user_message(request.messages)
    clarification_text = answer_contextual_clarification(user_text, request.messages)
    navigation_context = recent_context_for_navigation(request.messages)
    retrieval_text = (
        f"{navigation_context}\n{user_text}"
        if navigation_context and (is_followup_navigation(user_text) or clarification_text)
        else user_text
    )
    matches = retrieve(retrieval_text, knowledge)
    navigation = None if clarification_text else infer_navigation(user_text, matches, knowledge, navigation_context)
    answer_user_text = answer_text_for_navigation_followup(user_text, navigation, navigation_context)
    draft_text = clarification_text or answer_from_guardrails(answer_user_text, matches, knowledge)
    response_text, model_metadata = await maybe_model_answer(
        request=request,
        user_text=answer_user_text,
        messages=request.messages,
        pages=matches,
        draft_answer=draft_text,
        navigation=navigation,
        disabled=bool(request.metadata.get("disableModel")) or bool(clarification_text),
    )
    if navigation and navigation.get("auto") and "closest place on the site" not in response_text.lower():
        target = navigation["targets"][0]
        response_text += f"\n\nI found the closest place on the site: {target['title']}. I will take you there after this answer."

    handoff = None
    if is_handoff_request(user_text):
        response_text += (
            "\n\nI can record this as a handoff for Pathway. Please only share the minimum contact details "
            "you are comfortable sharing, such as your name and best phone or email."
        )
        handoff = write_handoff(request, user_text, response_text)

    response_text = format_for_chat_bubble(response_text)

    return JSONResponse(
        {
            "id": request.id or f"chat_{uuid.uuid4().hex[:12]}",
            "text": response_text,
            "matchedRoutes": [page.route for page in matches],
            "handoff": handoff,
            "guardrails": knowledge.get("guardrails", []),
            "navigation": navigation,
            "model": model_metadata,
        }
    )
