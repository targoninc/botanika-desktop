export class EventWriter {
    static info(message: string, data: any) {
        throw new Error("EventWriter is a base class and should not be used directly.");
    };

    static error(message: string, data: any) {
        throw new Error("EventWriter is a base class and should not be used directly.");
    };

    static warn(message: string, data: any) {
        throw new Error("EventWriter is a base class and should not be used directly.");
    };
}