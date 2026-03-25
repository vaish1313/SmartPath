import { DM_Sans, Instrument_Serif } from "next/font/google";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const instrumentSerif = Instrument_Serif({ weight: "400", subsets: ["latin"], variable: "--font-instrument-serif" });

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={`${dmSans.variable} ${instrumentSerif.variable}`}>
            {children}
        </div>
    );
}