import { useState, useEffect, useRef } from 'react';
import {
    KeyIcon,
    CheckCircleIcon,
    XCircleIcon,
    UserIcon,
    ClockIcon,
    EyeIcon,
    EyeSlashIcon,
    LockClosedIcon,
    ClipboardDocumentIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { sharingService, SharedCredentialDetail } from '../services/sharingService';
import PinVerification from '../components/PinVerification';
import SetupPin from '../components/SetupPin';
import { credentialService } from '../services/credentialService';

const SharedCredentials = () => {
    const [sharedByMe, setSharedByMe] = useState<SharedCredentialDetail[]>([]);
    const [sharedWithMe, setSharedWithMe] = useState<SharedCredentialDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'shared-by-me' | 'shared-with-me'>('shared-with-me');
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [viewDetailsId, setViewDetailsId] = useState<string | null>(null);
    const [showPinVerification, setShowPinVerification] = useState(false);
    const [showSetupPin, setShowSetupPin] = useState(false);
    const [pinError, setPinError] = useState<string | null>(null);
    const [pinAction, setPinAction] = useState<'accept' | 'remove' | 'view'>('accept');
    const [selectedSharingId, setSelectedSharingId] = useState<string | null>(null);
    const [decryptedPasswords, setDecryptedPasswords] = useState<Record<string, string>>({});
    const [decryptedPasswordVisibility, setDecryptedPasswordVisibility] = useState<Record<string, boolean>>({});
    const [isRefreshing, setIsRefreshing] = useState(false);

    const visibilityTimers = useRef<Record<string, NodeJS.Timeout>>({});

    useEffect(() => {
        fetchSharedCredentials();
        return () => {
            // Clear all timers on unmount
            Object.values(visibilityTimers.current).forEach(timer => clearTimeout(timer));
        };
    }, []);

    const fetchSharedCredentials = async () => {
        try {
            setIsLoading(true);
            const [byMeData, withMeData] = await Promise.all([
                sharingService.getCredentialsSharedByMe(),
                sharingService.getCredentialsSharedWithMe()
            ]);
            setSharedByMe(byMeData);
            setSharedWithMe(withMeData);
            setError(null);
        } catch (err) {
            console.error('Error fetching shared credentials:', err);
            setError('Failed to load shared credentials. Please try again.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const refreshData = () => {
        setIsRefreshing(true);
        fetchSharedCredentials();
    };

    const clearDecryptedPassword = (sharingId: string) => {
        setDecryptedPasswords(prev => {
            const { [sharingId]: _, ...rest } = prev;
            return rest;
        });
        setDecryptedPasswordVisibility(prev => {
            const { [sharingId]: _, ...rest } = prev;
            return rest;
        });
        if (visibilityTimers.current[sharingId]) {
            clearTimeout(visibilityTimers.current[sharingId]);
            delete visibilityTimers.current[sharingId];
        }
    };

    const handleAcceptSharing = (sharingId: string) => {
        setSelectedSharingId(sharingId);
        setPinAction('accept');
        setShowPinVerification(true);
    };

    const handleRemoveSharing = (sharingId: string) => {
        if (deleteConfirmId === sharingId) {
            setSelectedSharingId(sharingId);
            setPinAction('remove');
            setShowPinVerification(true);
            setDeleteConfirmId(null);
        } else {
            setDeleteConfirmId(sharingId);
            setTimeout(() => setDeleteConfirmId(null), 5000);
        }
    };

    const handleViewPassword = (sharingId: string) => {
        setSelectedSharingId(sharingId);
        setPinAction('view');
        setShowPinVerification(true);
    };

    const handlePinVerify = async (pin: string) => {
        if (!selectedSharingId) return;

        try {
            setPinError(null);

            if (pinAction === 'view') {
                const decrypted = await sharingService.decryptSharedPassword(selectedSharingId, pin);
                setDecryptedPasswords(prev => ({
                    ...prev,
                    [selectedSharingId]: decrypted.password
                }));
                setDecryptedPasswordVisibility(prev => ({
                    ...prev,
                    [selectedSharingId]: false // Initially hidden
                }));
                setSuccessMessage('Password decrypted successfully');

                // Set timeout to clear password
                if (visibilityTimers.current[selectedSharingId]) {
                    clearTimeout(visibilityTimers.current[selectedSharingId]);
                }
                visibilityTimers.current[selectedSharingId] = setTimeout(() => {
                    clearDecryptedPassword(selectedSharingId);
                }, 300000); // 5 minutes
            }
            else if (pinAction === 'accept') {
                await sharingService.acceptSharing(selectedSharingId, pin);
                setSharedWithMe(prev => prev.map(cred =>
                    cred.sharingId === selectedSharingId ? { ...cred, isAccepted: true } : cred
                ));
                setSuccessMessage('Sharing accepted successfully');
            }
            else if (pinAction === 'remove') {
                await sharingService.removeSharing(selectedSharingId, pin);
                if (activeTab === 'shared-by-me') {
                    setSharedByMe(prev => prev.filter(cred => cred.sharingId !== selectedSharingId));
                } else {
                    setSharedWithMe(prev => prev.filter(cred => cred.sharingId !== selectedSharingId));
                }
                setSuccessMessage('Sharing removed successfully');
            }

            setShowPinVerification(false);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            console.error(`Error ${pinAction === 'view' ? 'viewing' : pinAction === 'accept' ? 'accepting' : 'removing'} sharing:`, err);

            if (err.response?.status === 401) {
                setPinError('Invalid PIN. Please try again.');
            } else if (err.response?.status === 400 && err.response.data?.error?.includes('set a security PIN')) {
                setShowPinVerification(false);
                setShowSetupPin(true);
            } else {
                setPinError(`Failed to ${pinAction === 'view' ? 'view' : pinAction === 'accept' ? 'accept' : 'remove'} sharing. Please try again.`);
            }
        }
    };

    const handlePinCancel = () => {
        setShowPinVerification(false);
        setPinError(null);
    };

    const handleSetupPin = async (pin: string) => {
        try {
            await credentialService.setSecurityPin(pin);
            setShowSetupPin(false);
            setSuccessMessage('PIN set up successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            console.error('Error setting up PIN:', err);
            setError(err?.response?.data?.error || 'Failed to set up PIN. Please try again.');
        }
    };

    const toggleViewDetails = (sharingId: string) => {
        setViewDetailsId(prev => prev === sharingId ? null : sharingId);

        // Reset timer when showing details
        if (viewDetailsId !== sharingId && decryptedPasswords[sharingId]) {
            if (visibilityTimers.current[sharingId]) {
                clearTimeout(visibilityTimers.current[sharingId]);
            }
            visibilityTimers.current[sharingId] = setTimeout(() => {
                clearDecryptedPassword(sharingId);
            }, 300000); // 5 minutes
        }
    };

    const togglePasswordVisibility = (sharingId: string) => {
        setDecryptedPasswordVisibility(prev => ({
            ...prev,
            [sharingId]: !prev[sharingId]
        }));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setSuccessMessage('Copied to clipboard!');
        setTimeout(() => setSuccessMessage(null), 2000);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Shared Credentials</h1>
                <button
                    onClick={refreshData}
                    disabled={isRefreshing}
                    className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                    title="Refresh data"
                >
                    <ArrowPathIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
                    <XCircleIcon className="h-5 w-5 mr-2" />
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    {successMessage}
                </div>
            )}

            {/* Tab navigation */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex">
                    <button
                        onClick={() => setActiveTab('shared-with-me')}
                        className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${activeTab === 'shared-with-me'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Shared With Me ({sharedWithMe.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('shared-by-me')}
                        className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${activeTab === 'shared-by-me'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Shared By Me ({sharedByMe.length})
                    </button>
                </nav>
            </div>

            {/* No shared credentials message */}
            {(activeTab === 'shared-with-me' && sharedWithMe.length === 0) ||
                (activeTab === 'shared-by-me' && sharedByMe.length === 0) ? (
                <div className="text-center py-12">
                    <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">
                        No shared credentials
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {activeTab === 'shared-with-me'
                            ? 'No one has shared any passwords with you yet.'
                            : 'You haven\'t shared any passwords with others yet.'}
                    </p>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {(activeTab === 'shared-with-me' ? sharedWithMe : sharedByMe).map((credential) => (
                            <li key={credential.sharingId}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-primary-100 rounded-full">
                                                <KeyIcon className="h-6 w-6 text-primary-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{credential.accountName}</div>
                                                <div className="text-sm text-gray-500">{credential.serviceUrl}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {activeTab === 'shared-with-me' && !credential.isAccepted && (
                                                <button
                                                    onClick={() => handleAcceptSharing(credential.sharingId)}
                                                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                                                    Accept
                                                </button>
                                            )}

                                            <button
                                                onClick={() => toggleViewDetails(credential.sharingId)}
                                                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                {viewDetailsId === credential.sharingId ? (
                                                    <EyeSlashIcon className="h-4 w-4 mr-1" />
                                                ) : (
                                                    <EyeIcon className="h-4 w-4 mr-1" />
                                                )}
                                                {viewDetailsId === credential.sharingId ? 'Hide' : 'Details'}
                                            </button>

                                            <button
                                                onClick={() => handleRemoveSharing(credential.sharingId)}
                                                className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${deleteConfirmId === credential.sharingId
                                                        ? 'text-white bg-red-800 hover:bg-red-900'
                                                        : 'text-white bg-red-600 hover:bg-red-700'
                                                    }`}
                                            >
                                                <XCircleIcon className="h-4 w-4 mr-1" />
                                                {deleteConfirmId === credential.sharingId ? 'Confirm' : 'Remove'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Status indicators */}
                                    <div className="mt-2 flex items-center text-sm text-gray-500">
                                        <div className="flex items-center mr-4">
                                            <UserIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                            {activeTab === 'shared-with-me'
                                                ? `Shared by: ${credential.sharedByUsername}`
                                                : `Shared with: ${credential.sharedWithUsername}`}
                                        </div>
                                        <div className="flex items-center mr-4">
                                            <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                            Expires: {formatDate(credential.expirationDate)}
                                        </div>
                                        <div className="flex items-center">
                                            <LockClosedIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                            Status: {credential.isAccepted ? 'Accepted' : 'Pending'}
                                        </div>
                                    </div>

                                    {/* Details panel */}
                                    {viewDetailsId === credential.sharingId && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-md">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">Credential Details</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-xs text-gray-500">Account Name:</p>
                                                    <p className="font-medium">{credential.accountName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Service URL:</p>
                                                    <p className="font-medium">{credential.serviceUrl}</p>
                                                </div>
                                                {credential.notes && (
                                                    <div className="sm:col-span-2">
                                                        <p className="text-xs text-gray-500">Notes:</p>
                                                        <p className="whitespace-pre-wrap">{credential.notes}</p>
                                                    </div>
                                                )}
                                                <div className="sm:col-span-2">
                                                    <p className="text-xs text-gray-500">Password:</p>
                                                    {decryptedPasswords[credential.sharingId] ? (
                                                        <div className="flex items-center">uuu
                                                            <input
                                                                type={decryptedPasswordVisibility[credential.sharingId] ? 'text' : 'password'}
                                                                value={decryptedPasswords[credential.sharingId]}
                                                                readOnly
                                                                className="font-mono bg-gray-100 p-2 rounded w-full"
                                                            />
                                                            <button
                                                                onClick={() => togglePasswordVisibility(credential.sharingId)}
                                                                className="ml-2 p-1 text-gray-500 hover:text-gray-700"
                                                                title={decryptedPasswordVisibility[credential.sharingId] ? 'Hide password' : 'Show password'}
                                                            >
                                                                {decryptedPasswordVisibility[credential.sharingId] ? (
                                                                    <EyeSlashIcon className="h-5 w-5" />
                                                                ) : (
                                                                    <EyeIcon className="h-5 w-5" />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => copyToClipboard(decryptedPasswords[credential.sharingId])}
                                                                className="ml-2 p-1 text-gray-500 hover:text-gray-700"
                                                                title="Copy to clipboard"
                                                            >
                                                                <ClipboardDocumentIcon className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center">
                                                            <LockClosedIcon className="h-5 w-5 mr-1 text-gray-400" />
                                                            <button
                                                                onClick={() => handleViewPassword(credential.sharingId)}
                                                                className="text-primary-600 hover:text-primary-800 font-medium"
                                                            >
                                                                Enter PIN to view password
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        {activeTab === 'shared-with-me' ? 'Shared By:' : 'Shared With:'}
                                                    </p>
                                                    <p className="font-medium">
                                                        {activeTab === 'shared-with-me'
                                                            ? credential.sharedByUsername
                                                            : credential.sharedWithUsername}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Expiration Date:</p>
                                                    <p className="font-medium">{formatDate(credential.expirationDate)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Status:</p>
                                                    <p className={`font-medium ${credential.isAccepted ? 'text-green-600' : 'text-yellow-600'}`}>
                                                        {credential.isAccepted ? 'Accepted' : 'Pending Acceptance'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* PIN Verification Modal */}
            {showPinVerification && (
                <PinVerification
                    onVerify={handlePinVerify}
                    onCancel={handlePinCancel}
                    errorMessage={pinError}
                    action={pinAction === 'view' ? 'View Password' :
                        pinAction === 'accept' ? 'Accept Sharing' : 'Remove Sharing'}
                />
            )}

            {/* PIN Setup Modal */}
            {showSetupPin && (
                <SetupPin
                    onSetup={handleSetupPin}
                    onCancel={() => setShowSetupPin(false)}
                />
            )}
        </div>
    );
};

export default SharedCredentials;
