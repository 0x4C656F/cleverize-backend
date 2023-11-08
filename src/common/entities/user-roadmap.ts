export default interface user_roadmap {
	title: string;
	node_list: {
		title: string;
		sub_roadmap_id: string | undefined;
	}[];
	owner_id: string;
	created_at: Date;
}
