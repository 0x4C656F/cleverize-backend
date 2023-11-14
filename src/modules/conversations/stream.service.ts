import { Injectable } from "@nestjs/common";
import { Observable, Subject } from "rxjs";

@Injectable()
export class StreamService {
	private dataStream = new Subject<string>();

	sendData(data: string) {
		this.dataStream.next(data);
	}

	getDataStream(): Observable<string> {
		return this.dataStream.asObservable();
	}
}
