const url =  import.meta.env.VITE_API_URL;
// const bearerToken =  localStorage.getItem("token");

const login = async (data: any, endpoint: string , error_message:string , method:string='POST') => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Only include body for POST
  if (method === 'POST') {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url+endpoint, options);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.log(error, error_message)
    return 0
  }

};
const submitContents = async (data: any, endpoint: string , method:string='POST') => {
  console.log("bearer===========>", data , endpoint , method);
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ localStorage.getItem("token")}`
    },
  };

  // Only include body for POST
  if (method === 'POST') {
    options.body = JSON.stringify(data);
  }
  // console.log("body===============>", options)
  try {
    const response = await fetch(url+endpoint, options);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (err) {
  throw new Error(`HTTP error! Status: `);
  }

};



const contentAll = async (data: any, endpoint: string , method:string='POST') => {
  console.log("bearer===========>", data , endpoint , method);
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem("token")}`
    },
  };

  // Only include body for POST
  if (method === 'POST') {
    options.body = JSON.stringify(data);
  }
  // console.log("body===============>", options)
  try {
    const response = await fetch(url+endpoint, options);

    if (!response.ok) {
      // throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (err) {
   localStorage.clear();
  // console.log("error==================>", err) 
    return 0;
  }

};
const fetchProfile = async (endpoint: string , method:string='GET') => {
  // console.log("bearer===========>", data , endpoint , method);
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem("token")}`
    },
  };


  // console.log("body===============>", options)
  try {
    const response = await fetch(url+endpoint, options);

    if (!response.ok) {
      // throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (err) {
  //  localStorage.clear();
  // console.log("error==================>", err) 
    return 0;
  }

};



export {login , submitContents , contentAll , fetchProfile};




















