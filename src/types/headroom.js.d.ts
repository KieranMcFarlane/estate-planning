declare module "headroom.js" {
    export interface HeadroomOptions {
        offset?: number | { up?: number; down?: number };
        tolerance?: number | { up?: number; down?: number };
        classes?: Partial<{
            initial: string;
            pinned: string;
            unpinned: string;
            top: string;
            notTop: string;
            bottom: string;
            notBottom: string;
            frozen: string;
        }>;
        scroller?: Element | Window;
        onPin?: () => void;
        onUnpin?: () => void;
        onTop?: () => void;
        onNotTop?: () => void;
        onBottom?: () => void;
        onNotBottom?: () => void;
    }

    export default class Headroom {
        static cutsTheMustard: boolean;

        constructor(element: Element, options?: HeadroomOptions);
        init(): void;
        destroy(): void;
        pin(): void;
        unpin(): void;
        freeze(): void;
        unfreeze(): void;
    }
}
