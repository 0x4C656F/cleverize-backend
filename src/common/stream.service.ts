import { Injectable } from "@nestjs/common";
import { Subscriber } from "rxjs";

@Injectable()
export class StreamService {
	private subscribers = new Map<string, Subscriber<any>>();

	addSubscriber(id: string, subscriber: Subscriber<any>) {
		this.subscribers.set(id, subscriber);
		return () => this.subscribers.delete(id);
	}

	sendData(id: string, data: any): void {
		const subscriber = this.subscribers.get(id);
		if (subscriber) {
			subscriber.next(data);
		}
	}

	closeStream(id: string): void {
		if (this.subscribers.has(id)) {
			const subscriber = this.subscribers.get(id);
			subscriber.complete(); // Complete the subscriber's observable
			this.subscribers.delete(id); // Remove the subscriber
		}
	}
}
