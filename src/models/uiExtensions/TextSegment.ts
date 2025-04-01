import {HtmlPropertyValue, TypeOrSignal} from "../../ui/lib/fjsc/src/f2";
import {TextSegmentType} from "../../ui/enums/TextSegmentType";

export interface TextSegment {
    text: HtmlPropertyValue;
    type: TypeOrSignal<TextSegmentType>;
}