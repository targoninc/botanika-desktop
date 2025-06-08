import {TextSegmentType} from "../../ui/enums/TextSegmentType";
import {HtmlPropertyValue, TypeOrSignal} from "@targoninc/jess";

export interface TextSegment {
    text: HtmlPropertyValue;
    type: TypeOrSignal<TextSegmentType>;
}