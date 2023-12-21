import { Injectable } from "@nestjs/common";
import { Subscriber } from "rxjs";

@Injectable()
export class StreamService {
	private subscribers = new Map<string, Subscriber<any>>();

	addSubscriber(conversationId: string, subscriber: Subscriber<any>) {
		this.subscribers.set(conversationId, subscriber);
		return () => this.subscribers.delete(conversationId);
	}

	sendData(conversationId: string, data: any): void {
		console.log(data, "sent");
		const subscriber = this.subscribers.get(conversationId);
		if (subscriber) {
			subscriber.next(data);
		}
	}

	closeStream(conversationId: string): void {
		if (this.subscribers.has(conversationId)) {
			const subscriber = this.subscribers.get(conversationId);
			subscriber.complete(); // Complete the subscriber's observable
			this.subscribers.delete(conversationId); // Remove the subscriber
		}
	}
}
