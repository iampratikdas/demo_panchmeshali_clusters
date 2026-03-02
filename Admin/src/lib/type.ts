export interface ContentState {
    data: 
        {id: String;
        type: String;
        parentId: String  | null;
        contents: any;}[];
    isLoading: Boolean;
}
export interface ContentsDashboard
    {id: String;
        type: String;
        parentId: String  | null;
        contents: any;}[];

export interface SingleContentState {
    data: 
        {id: String;
        type: String;
        parentId: String  | null;
        contents: any;};
    isLoading: Boolean;
}
export interface UserContentState {
    data: 
        {user_id: String;
        role: String;
        email: String;
        user_name: String;
        token: String;
        device_id: String;};
    isLoading: Boolean;
}