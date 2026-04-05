"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPaymentOrder, verifyPayment } from "@/lib/api";
import { Loader2, CreditCard } from "lucide-react";
import axios from "axios";

interface Props {
    invoiceId: string;
    amount: number; // in rupees
    patientName: string;
    patientEmail?: string;
    patientPhone?: string;
}

// Extend window type for Razorpay
declare global {
    interface Window {
        Razorpay: new (options: Record<string, unknown>) => { open: () => void };
    }
}

function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
        if (typeof window.Razorpay !== "undefined") { resolve(true); return; }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

export default function PayNowButton({ invoiceId, amount, patientName, patientEmail, patientPhone }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handlePayNow = async () => {
        setLoading(true);

        // Load Razorpay checkout script
        const loaded = await loadRazorpayScript();
        if (!loaded) {
            alert("Failed to load payment gateway. Check your internet connection.");
            setLoading(false);
            return;
        }

        // Create order on backend
        let orderData: {
            orderId: string;
            keyId: string;
            amount: number;
            currency: string;
            invoiceId: string;
            invoiceNumber: string;
        };

        try {
            const res = await createPaymentOrder(invoiceId);
            orderData = res.data;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                alert(err.response.data.message);
            } else {
                alert("Could not initiate payment. Try again.");
            }
            setLoading(false);
            return;
        }

        // Open Razorpay modal
        const options: Record<string, unknown> = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "Prathamesh Advanced Diagnostic Center",
            description: `Invoice ${orderData.invoiceNumber}`,
            order_id: orderData.orderId,
            prefill: {
                name: patientName,
                email: patientEmail || "",
                contact: patientPhone || "",
            },
            theme: { color: "#0ea5e9" },
            handler: async (response: {
                razorpay_order_id: string;
                razorpay_payment_id: string;
                razorpay_signature: string;
            }) => {
                // Verify payment on backend
                try {
                    await verifyPayment({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        invoiceId: orderData.invoiceId,
                    });
                    router.push("/bookings?payment=success");
                } catch {
                    alert("Payment verification failed. Contact the lab.");
                }
            },
            modal: {
                ondismiss: () => { setLoading(false); },
            },
        };

        const rzp = new window.Razorpay(options);

        rzp.open();

        // Listen for payment failure
        (rzp as unknown as { on: (event: string, cb: (resp: { error: { description: string } }) => void) => void })
            .on("payment.failed", (resp) => {
                alert(`Payment failed: ${resp.error.description}`);
                setLoading(false);
            });
    };

    return (
        <button
            onClick={handlePayNow}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-200"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <CreditCard className="w-4 h-4" />
            )}
            {loading ? "Processing..." : `Pay ₹${amount}`}
        </button>
    );
}
