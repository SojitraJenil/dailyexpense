import React, { useState, useCallback, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useRouter } from "next/router"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import Cookies from "universal-cookie";
import { FcGoogle } from "react-icons/fc";

interface FormValues {
    name: string;
    mobileNumber: string;
    password: string;
}

interface Errors {
    name?: string;
    mobileNumber?: string;
    password?: string;
}

const Login: React.FC = () => {
    const [formValues, setFormValues] = useState<FormValues>({
        name: "",
        mobileNumber: "",
        password: "",
    });
    const [errors, setErrors] = useState<Errors>({});
    const [loader, setLoader] = useState<boolean>(false);
    const router = useRouter();
    const cookies = new Cookies();

    useEffect(() => {
        const authToken = cookies.get("auth-token");
        if (authToken) {
            router.push("/landing");
        }
    }, [cookies, router]);

    const validateForm = useCallback((): Errors => {
        const errors: Errors = {};

        if (!formValues.name.trim()) {
            errors.name = "Name is required";
        }

        if (!formValues.mobileNumber.trim()) {
            errors.mobileNumber = "Mobile number is required";
        } else if (!/^\d{10}$/.test(formValues.mobileNumber)) {
            errors.mobileNumber = "Mobile number must be 10 digits";
        }

        if (!formValues.password.trim()) {
            errors.password = "Password is required";
        } else if (formValues.password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        }

        return errors;
    }, [formValues]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = event.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            [id]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        try {
            setLoader(true);
            await addDoc(collection(db, "users"), formValues);
            setFormValues({
                name: "",
                mobileNumber: "",
                password: "",
            });

            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);
            cookies.set("auth-token", "dummy-auth-token", { expires: expiryDate });

            router.push("/landing");
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Error adding document: " + error);
        } finally {
            setLoader(false);
        }
    };

    const signInGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);
            cookies.set("auth-token", result.user.refreshToken, { expires: expiryDate });
            router.push("/landing");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="relative bg-gray-200">
            <div className="flex items-center justify-center h-screen relative z-30 ">
                <div className="max-w-md w-full px-6 py-8 bg-white shadow-md overflow-hidden sm:rounded-lg opacity-80">
                    <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                        Get Started
                    </h2>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                maxLength={10}
                                value={formValues.name}
                                onChange={handleChange}
                                className="mt-1 p-2 text-black block w-full border-gray-500 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Enter your Name"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                            )}
                        </div>
                        <div>
                            <label
                                htmlFor="mobileNumber"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Mobile Number
                            </label>
                            <input
                                type="number"
                                id="mobileNumber"
                                value={formValues.mobileNumber}
                                onChange={handleChange}
                                maxLength={10}
                                className="mt-1 p-2 text-black block w-full border-gray-500 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Enter your Mobile Number"
                            />
                            {errors.mobileNumber && (
                                <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>
                            )}
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={formValues.password}
                                onChange={handleChange}
                                className="mt-1 text-black p-2 block w-full border-gray-500 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Create a password"
                            />
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                            )}
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={loader}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {loader ? (
                                    <div
                                        className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
                                        role="status"
                                    ></div>
                                ) : (
                                    "Join Room"
                                )}
                            </button>
                        </div>
                    </form>
                    <hr className="text-gray-100 my-4" />
                    <button
                        onClick={signInGoogle}
                        className="bg-white border py-2 w-full rounded-xl mt-5 flex justify-center items-center text-sm hover:scale-70 duration-300 text-[#002D74]"
                    >
                        <FcGoogle className="text-2xl me-4" />
                        Login with Google
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
