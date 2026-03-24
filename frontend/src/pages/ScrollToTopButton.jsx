/*Apply cho toàn bộ trang web tiện cho việc tái sử dụng*/
import {useEffect, useState} from "react"
import {ChevronUp} from "lucide-react"

export default function ScrollToTop(){
    const [visible, setVisible] = useState(false);

    useEffect(() =>{
        const toggleVisible = () => {
            setVisible(window.scrollY > 300);
        };
        window.addEventListener("scroll", toggleVisible);
        return () => window.removeEventListener("scroll", toggleVisible);
    }, []);

    const handleScrollTop = () => {
        window.scrollTo({
            top: 0,
            hehavior: "smooth",
        });
    };
    return (
        <button
            onClick={handleScrollTop}
            style={{
                position: "fixed",
                right: "24px",
                bottom: "24px",
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                border: "none",
                background: "#2563eb",
                color: "#fff",
                display: visible ? "flex" : "none",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
                zIndex: 9999,
                transition: "all 0.3s ease",
            }}
            aria-label="Scroll to top"
            title="Lên đầu trang"
        >
        <ChevronUp size={24} />
        </button>
    );
}