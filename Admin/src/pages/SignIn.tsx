import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/components/layout/AuthLayout";
import { login } from "@/auth/api"
import { Hourglass } from 'react-loader-spinner';
import React from "react";
import { ToastContainer, toast } from 'react-toastify';

const SignIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    ip: ""
  });

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/")
    }
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // console.log("data===>", formData)
    setLoading(true)
    const response = await login(formData, "/login", "Either email or Password is wrong");
    setLoading(false)
    if (response.status === 200) {
      toast.success("You are successfully logged In, wait some time to prepare for you.");
      localStorage.setItem("token", response.data.tokenAdvanced);
      localStorage.setItem("full_name", response.data.user.full_name);
      localStorage.setItem("phone_number", response.data.user.phone_number);
      localStorage.setItem("role", response.data.user.role);
      localStorage.setItem("isfirstTimeLogin", response.data.user.isfirstTimeLogin);
      localStorage.setItem("uid", response.data.user.uid);

      navigate("/");
    }
    if(response=== 0){
      toast.error("Either password or email is wrong");
    }
  };


  return (
    <React.Fragment>
  <ToastContainer  position="top-center" toastClassName="custom-toast" />
      {
        (() => {
          if (loading) {
            return (
      
              <Hourglass
                visible={true}
                // height="80"
                // width="80"

                ariaLabel="hourglass-loading"
                wrapperStyle={{
                  position: "absolute", zIndex: "1000", top: "40%",
                  left: "36%",
                  // transform: "translate(-50%, -50%)"
                }}
                wrapperClass=""
                colors={['#306cce', '#72a1ed']}
              />
     
              
            )
          }
        })()
      }
      <AuthLayout title="Welcome Back!! to Panchmeshali">
      
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block mb-2 font-medium text-blank"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email id"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <label htmlFor="password" className="font-medium text-blank">
                Password
              </label>
              {/* <a
                  href="/forgot-password"
                  className="text-sm text-blank hover:underline"
                >
                  Forgot password?
                </a> */}
            </div>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          {/* <div className="mb-5">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-gray-300 rounded focus:ring-black text-black"
                />
                <span className="ml-2 text-blank">Remember for 30 days</span>
              </label>
            </div> */}

          <button
            type="submit"
            className="w-full py-3 mb-4 bg-black text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
          >
            Sign in
          </button>

          {/* <p className="text-center text-blank">
              Don't have an account?
              <a
                href="/signup"
                className="text-blank font-medium ml-1 hover:underline"
              >
                Sign up
              </a>
            </p> */}
        </form>
      </AuthLayout>

    </React.Fragment>

  );
};

export default SignIn;
