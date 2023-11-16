import { Injectable } from "@nestjs/common";
import { Observable, Subject } from "rxjs";

@Injectable()
export class StreamService {
	private streams = new Map<string, Subject<string>>();

	sendData(conversationId: string, data: string) {
		if (!this.streams.has(conversationId)) {
			this.streams.set(conversationId, new Subject<string>());
		}
		this.streams.get(conversationId)?.next(data);
	}

	getDataStream(conversationId: string): Observable<string> {
		if (!this.streams.has(conversationId)) {
			this.streams.set(conversationId, new Subject<string>());
		}
		return this.streams.get(conversationId).asObservable();
	}

	// Optional: Method to close a stream when the conversation ends
	closeStream(conversationId: string) {
		if (this.streams.has(conversationId)) {
			this.streams.get(conversationId)?.complete();
			this.streams.delete(conversationId);
		}
	}
}
