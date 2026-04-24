const apiJson = {
    loginUser: {
        url: "/login",
        method: "POST"
    },
    submitContents: {
        url: "/submit_contents",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
    },
    fetchUsers: {
        url: (page: number, limit: number) => `/user_list?page=${page}&limit=${limit}`,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
    },
    createUser: {
        url: "/create_user",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
    },
    updateUser: {
        url: "/update_user",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
    },
    searchList: {
        url: (searchType: string, page: number, limit: number) => `/search_list/${searchType}?page=${page}&limit=${limit}`,
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
    },
};

export default apiJson;
