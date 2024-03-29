export enum SubscriptionTypeEnum {
	PRO = "pro",
}

export const DEFAULT_CREDITS = 50;
export const GENERATE_ROADMAP_CREDIT_COST = 30;
export const INIT_LESSON_CREDIT_COST = 2;
export const ADD_MESSAGE_CREDIT_COST = 2;
export const INIT_QUIZ_CREDIT_COST = 1;
export const LOAD_TEMPLATE_CREDIT_COST = 10;

export class Subscription {
	public credits: number;
	public last_credits_update: Date;
	public stripe_customer_id: string;
}

export const subscriptionDefaultObject: Subscription = {
	credits: DEFAULT_CREDITS,
	last_credits_update: new Date(),
	stripe_customer_id: undefined,
};
