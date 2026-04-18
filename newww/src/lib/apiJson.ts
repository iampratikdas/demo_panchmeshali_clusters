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
    }
};

export default apiJson;
