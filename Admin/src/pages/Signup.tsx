import { useState } from 'react';
import AuthLayout from "@/components/layout/AuthLayout";
const Login = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    
  
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
    };

    return (
     <AuthLayout title="Lets Join In Our World">
                <form onSubmit={handleSubmit}>
                    <div className="mb-5">
                        <label htmlFor="name" className="block mb-2 font-medium text-gray-700">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                    </div>

                    <div className="mb-5">
                        <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                    </div>

                    <div className="mb-5">
                        <label htmlFor="password" className="block mb-2 font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full py-3 mb-4 bg-black text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
                    >
                        Create account
                    </button>

                   

                    <p className="text-center text-gray-500">
                        Already have an account? 
                        <a href="/signin" className="text-black font-medium ml-1 hover:underline">
                            Log in
                        </a>
                    </p>
                </form>
     </AuthLayout>

            
    );
};

export default Login;