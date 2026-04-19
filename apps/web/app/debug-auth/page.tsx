"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";

export default function DebugAuthPage() {
    const { user, token } = useAuthStore();
    const [debugInfo, setDebugInfo] = useState<any>({});
    const [testResult, setTestResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Get debug info
        const localToken = localStorage.getItem("smartpath_token");
        const localUser = localStorage.getItem("smartpath_user");

        setDebugInfo({
            storeToken: token,
            storeUser: user,
            localStorageToken: localToken,
            localStorageUser: localUser ? JSON.parse(localUser) : null,
            tokenLength: localToken?.length || 0,
            tokenPreview: localToken ? `${localToken.substring(0, 20)}...` : null,
        });
    }, [token, user]);

    const testProfileAPI = async () => {
        setLoading(true);
        setTestResult(null);

        try {
            const token = localStorage.getItem("smartpath_token");

            // Test 1: Direct axios call
            const response = await axios.get(
                "https://patient-service-kfu5.onrender.com/api/patients/profile",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setTestResult({
                success: true,
                status: response.status,
                data: response.data,
            });
        } catch (error: any) {
            setTestResult({
                success: false,
                status: error.response?.status,
                message: error.response?.data?.message || error.message,
                fullError: error.response?.data,
            });
        } finally {
            setLoading(false);
        }
    };

    const testAuthMeAPI = async () => {
        setLoading(true);
        setTestResult(null);

        try {
            const token = localStorage.getItem("smartpath_token");

            const response = await axios.get(
                "https://patient-service-kfu5.onrender.com/api/auth/me",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setTestResult({
                success: true,
                status: response.status,
                data: response.data,
            });
        } catch (error: any) {
            setTestResult({
                success: false,
                status: error.response?.status,
                message: error.response?.data?.message || error.message,
                fullError: error.response?.data,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Auth Debug Page</h1>

                {/* Debug Info */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
                    <pre className="bg-slate-100 p-4 rounded overflow-auto text-xs">
                        {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                </div>

                {/* Test Buttons */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">API Tests</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={testProfileAPI}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            Test /api/patients/profile
                        </button>
                        <button
                            onClick={testAuthMeAPI}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            Test /api/auth/me
                        </button>
                    </div>
                </div>

                {/* Test Results */}
                {testResult && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Test Result:{" "}
                            <span
                                className={
                                    testResult.success ? "text-green-600" : "text-red-600"
                                }
                            >
                                {testResult.success ? "SUCCESS" : "FAILED"}
                            </span>
                        </h2>
                        <div className="space-y-2">
                            <p>
                                <strong>Status:</strong> {testResult.status}
                            </p>
                            {testResult.message && (
                                <p>
                                    <strong>Message:</strong> {testResult.message}
                                </p>
                            )}
                        </div>
                        <pre className="bg-slate-100 p-4 rounded overflow-auto text-xs mt-4">
                            {JSON.stringify(testResult, null, 2)}
                        </pre>
                    </div>
                )}

                {/* Instructions */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                    <h3 className="font-semibold mb-2">Instructions:</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Make sure you're logged in first</li>
                        <li>Check the debug information above</li>
                        <li>Click "Test /api/patients/profile" to test the API</li>
                        <li>Check the test result for errors</li>
                        <li>
                            If you see 401 error: Token is invalid or expired - try logging
                            in again
                        </li>
                        <li>
                            If you see 400 error: Check the error message for validation
                            issues
                        </li>
                        <li>
                            If you see 404 error: User not found in database - check if user
                            exists
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
