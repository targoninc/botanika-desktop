import {LayoutTemplates} from "./templates/layout.templates";
import {activePage, initializeStore} from "./classes/store";
import {addShortCutListener} from "./classes/shortcuts";
import {initializeWhisper, startTranscription} from "./asr/whisper";
import {Api} from "./classes/api";

initializeStore();

const content = document.getElementById('content');
const app = LayoutTemplates.app(activePage);
content.appendChild(app);

addShortCutListener();

/*Api.getOpenAiKey().then(res => {
    if (res.success) {
        initializeWhisper(res.data as string);
        startTranscription();
    }
})*/