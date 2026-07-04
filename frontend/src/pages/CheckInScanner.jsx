import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useParams, useNavigate } from 'react-router-dom';
import { RiArrowLeftLine, RiCheckLine, RiErrorWarningLine } from 'react-icons/ri';
import OrgDashboardNavbar from '../components/OrgDashboardNavbar';
import { UserContext } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import './CheckInScanner.css';

const CheckInScanner = ({ onLogout }) => {
    const { id } = useParams(); // Event ID
    const navigate = useNavigate();
    const { currentUser } = useContext(UserContext);
    const toast = useToast();

    const [isScanning, setIsScanning] = useState(true);
    const [scanResult, setScanResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckIn = useCallback(async (userId) => {
        setIsLoading(true);
        const token = localStorage.getItem('igniteUserToken') || sessionStorage.getItem('igniteUserToken');
        try {
            const response = await fetch(`http://localhost:5000/api/events/${id}/checkin`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userId }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Check-in failed');

            setScanResult({ success: true, message: data.message, participant: data.participant });
            toast.success("Check-in successful! ✅");
        } catch (err) {
            setScanResult({ success: false, message: err.message });
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [id, toast]);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner('reader', {
            qrbox: { width: 280, height: 280 },
            fps: 10, // Increased for better responsiveness
        }, false);

        let isCleaningUp = false;

        const onScanSuccess = async (result) => {
            if (isCleaningUp) return;

            try {
                const data = JSON.parse(result);
                if (data.eventId !== id) {
                    toast.error("This ticket belongs to another event.");
                    return; // Continue scanning
                }

                // Stop and process
                isCleaningUp = true;
                await scanner.clear();
                setIsScanning(false);
                handleCheckIn(data.userId);
            } catch (err) {
                // If it's not JSON, it might be a different type of QR
                toast.error("Invalid QR code scanned.");
            }
        };

        function onScanError(err) {
            // Silence noise
        }

        // Delay a bit to ensure target div is ready in DOM
        const timer = setTimeout(() => {
            const readerDiv = document.getElementById('reader');
            if (readerDiv) {
                scanner.render(onScanSuccess, onScanError);
            }
        }, 300);

        return () => {
            clearTimeout(timer);
            isCleaningUp = true;
            scanner.clear().catch(e => console.error("Scanner clear failed", e));
        };
    }, [id, handleCheckIn, toast]);

    const resetScanner = () => {
        setScanResult(null);
        setIsScanning(true);
        window.location.reload(); // Simplest way to restart scanner instance
    };

    return (
        <div className="dashboard-page">
            <OrgDashboardNavbar user={currentUser} onLogout={onLogout} />

            <main className="dashboard-content-area scanner-container">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <RiArrowLeftLine /> Back to Event Details
                </button>

                <div className="scanner-card">
                    <div className="scanner-header">
                        <h1>QR Check-in</h1>
                        <p>Scan participant's QR code to mark attendance</p>
                    </div>

                    {isScanning ? (
                        <div id="reader" className="qr-reader-view"></div>
                    ) : (
                        <div className="scan-result-view">
                            {isLoading ? (
                                <div className="scanner-loading">Processing...</div>
                            ) : scanResult?.success ? (
                                <div className="result-success">
                                    <div className="result-icon success"><RiCheckLine /></div>
                                    <h2>Check-in Successful</h2>
                                    <p>User has been marked as attended.</p>
                                    <button className="btn-primary" onClick={resetScanner}>Scan Next</button>
                                </div>
                            ) : (
                                <div className="result-error">
                                    <div className="result-icon error"><RiErrorWarningLine /></div>
                                    <h2>Check-in Failed</h2>
                                    <p>{scanResult?.message}</p>
                                    <button className="btn-primary" onClick={resetScanner}>Try Again</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CheckInScanner;
