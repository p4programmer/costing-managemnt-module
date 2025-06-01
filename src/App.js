import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlusCircle, Trash2, GripVertical, Package, DollarSign, List, Info, Image as ImageIcon, Move, Target } from 'lucide-react';

// Mock initial data since Firebase is removed
const MOCK_INITIAL_COMPONENTS = [
    { id: 'comp1', firestoreId: 'comp1', name: 'Aluminum Headrail', cost: 15.75 },
    { id: 'comp2', firestoreId: 'comp2', name: 'Blackout Fabric (sq ft)', cost: 5.50 },
    { id: 'comp3', firestoreId: 'comp3', name: 'Plastic Chain Control', cost: 3.20 },
    { id: 'comp4', firestoreId: 'comp4', name: 'Mounting Brackets (pair)', cost: 2.50 },
];


// SVG Diagram for the Blind
const BlindDiagram = React.memo(() => (
    <svg viewBox="0 0 200 150" className="absolute inset-0 w-full h-full object-contain pointer-events-none">
        <defs>
            <linearGradient id="blindGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#f0f4f8', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#d9e2ec', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <rect x="10" y="20" width="180" height="120" fill="url(#blindGradient)" stroke="#c0cad5" strokeWidth="0.5" rx="2" ry="2"/>
        <rect x="8" y="10" width="184" height="12" fill="#d1d5db" stroke="#b0b8c4" strokeWidth="0.5" rx="1.5" ry="1.5"/>
        <rect x="10" y="11.5" width="180" height="9" fill="#e5e7eb" rx="1" ry="1"/>
        <rect x="10" y="138" width="180" height="8" fill="#c0cad5" stroke="#a0acc0" strokeWidth="0.5" rx="1.5" ry="1.5"/>
        <rect x="12" y="139.5" width="176" height="5" fill="#d1d5db" rx="1" ry="1"/>
        <line x1="180" y1="30" x2="180" y2="70" stroke="#a0aec0" strokeWidth="1" />
        <circle cx="180" cy="75" r="2.5" fill="#a0aec0" />
    </svg>
));


const DraggableComponent = ({ component, onDragStart }) => {
    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, component)}
            className="flex items-center justify-between p-3 mb-2 bg-gray-100 dark:bg-gray-700 rounded-lg shadow cursor-grab active:cursor-grabbing"
        >
            <div className="flex items-center">
                <GripVertical size={20} className="mr-2 text-gray-500 dark:text-gray-400" />
                <Package size={20} className="mr-2 text-blue-500" />
                <span className="font-medium text-gray-800 dark:text-gray-200">{component.name}</span>
            </div>
            <div className="flex items-center">
                <DollarSign size={16} className="mr-1 text-green-600 dark:text-green-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">{parseFloat(component.cost).toFixed(2)}</span>
            </div>
        </div>
    );
};

const DroppedComponentItem = ({ component, onRemove, onComponentDragStart, isDragging }) => {
    return (
        <div
            style={{
                position: 'absolute',
                left: `${component.x}px`,
                top: `${component.y}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: isDragging ? 100 : 10, 
                cursor: isDragging ? 'grabbing' : 'grab',
            }}
            className="p-2 bg-sky-200 dark:bg-sky-700 border border-sky-500 dark:border-sky-400 rounded-md shadow-xl w-auto max-w-[150px] group"
            onMouseDown={(e) => onComponentDragStart(e, component.instanceId)}
        >
            <div className="flex flex-col items-center text-center">
                <Move size={12} className="text-sky-600 dark:text-sky-400 mb-1 opacity-70 group-hover:opacity-100" />
                <Package size={18} className="mb-1 text-sky-700 dark:text-sky-300" />
                <span className="text-xs font-semibold text-sky-800 dark:text-sky-200 break-words">{component.name}</span>
                <div className="flex items-center mt-1">
                    <DollarSign size={12} className="mr-0.5 text-green-700 dark:text-green-400" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">{parseFloat(component.cost).toFixed(2)}</span>
                </div>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation(); 
                    onRemove(component.instanceId);
                }}
                className="absolute -top-2 -right-2 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-700 transition-all duration-150 z-20"
                aria-label="Remove component from blind"
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
};


const AddComponentForm = ({ onAddComponent, isSaving }) => {
    const [name, setName] = useState('');
    const [cost, setCost] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !cost.trim()) {
            setError('Name and cost cannot be empty.');
            return;
        }
        const costValue = parseFloat(cost);
        if (isNaN(costValue) || costValue < 0) {
            setError('Please enter a valid positive cost.');
            return;
        }
        setError('');
        // Use crypto.randomUUID() for firestoreId as well for local consistency
        onAddComponent({ name, cost: costValue, id: crypto.randomUUID(), firestoreId: crypto.randomUUID() });
        setName('');
        setCost('');
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Add New Component</h3>
            {error && <div className="mb-3 p-2 text-sm text-red-700 bg-red-100 dark:text-red-200 dark:bg-red-700 rounded-md">{error}</div>}
            <div className="mb-3">
                <label htmlFor="componentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Component Name</label>
                <input
                    type="text"
                    id="componentName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Headrail"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="componentCost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost</label>
                <input
                    type="number"
                    id="componentCost"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="e.g., 10.50"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
            </div>
            <button
                type="submit"
                disabled={isSaving} // isSaving can be repurposed for local async-like behavior if needed, or removed
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
                <PlusCircle size={20} className="mr-2" />
                {isSaving ? 'Adding...' : 'Add Component'}
            </button>
        </form>
    );
};


function App() {
    const [availableComponents, setAvailableComponents] = useState(MOCK_INITIAL_COMPONENTS);
    const [currentBlindComponents, setCurrentBlindComponents] = useState([]);
    const [totalCost, setTotalCost] = useState(0);
    const [blindName, setBlindName] = useState('My New Blind');
    // isLoading states can be simplified or removed if data is always local/synchronous
    const [isLoadingComponents, setIsLoadingComponents] = useState(false); 
    const [isSavingComponent, setIsSavingComponent] = useState(false); // Can be used for visual feedback
    const [isSavingAssembly, setIsSavingAssembly] = useState(false); // Can be used for visual feedback
    
    const [currentAssemblyId, setCurrentAssemblyId] = useState(null); // Still useful for local "editing" state
    const [savedAssemblies, setSavedAssemblies] = useState([]);
    const [isLoadingAssemblies, setIsLoadingAssemblies] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const dropZoneRef = useRef(null);
    const [draggingItem, setDraggingItem] = useState({ id: null, type: null, offsetX: 0, offsetY: 0 }); 

    // Removed Firebase-related useEffects for auth, components, and assemblies fetching.

    useEffect(() => {
        setTotalCost(currentBlindComponents.reduce((s, c) => s + parseFloat(c.cost), 0));
    }, [currentBlindComponents]);

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    };

    const handleAddComponentToLibrary = (data) => {
        // Simulate saving for visual feedback if needed
        setIsSavingComponent(true);
        setAvailableComponents(prev => [...prev, data]);
        showNotification(`Component "${data.name}" added locally!`, 'success');
        setIsSavingComponent(false);
    };

    const handleExternalDragStart = (e, comp) => e.dataTransfer.setData("application/json", JSON.stringify(comp));
    const handleDragOver = (e) => e.preventDefault();

    const handleDrop = (e) => {
        e.preventDefault();
        const compDataStr = e.dataTransfer.getData("application/json");
        if (compDataStr && dropZoneRef.current) {
            const dropped = JSON.parse(compDataStr);
            const rect = dropZoneRef.current.getBoundingClientRect();
            const dropX = e.clientX - rect.left;
            const dropY = e.clientY - rect.top;
            const boundedX = Math.max(0, Math.min(dropX, rect.width));
            const boundedY = Math.max(0, Math.min(dropY, rect.height));
            
            const lineTargetX = rect.width / 2;
            const lineTargetY = rect.height / 2;

            setCurrentBlindComponents(p => [...p, { 
                ...dropped, 
                instanceId: crypto.randomUUID(),
                x: boundedX, y: boundedY,
                lineTargetX: lineTargetX, 
                lineTargetY: lineTargetY  
            }]);
        }
    };

    const handleRemoveComponentFromBlind = (id) => setCurrentBlindComponents(p => p.filter(c => c.instanceId !== id));

    const handleComponentDragStart = useCallback((e, instanceId) => {
        e.preventDefault();
        const itemNode = e.currentTarget;
        const itemRect = itemNode.getBoundingClientRect();
        setDraggingItem({
            id: instanceId,
            type: 'component',
            offsetX: e.clientX - itemRect.left,
            offsetY: e.clientY - itemRect.top,
        });
    }, []);

    const handleLineTargetDragStart = useCallback((e, instanceId) => {
        e.preventDefault();
        e.stopPropagation(); 
        const dropZoneRect = dropZoneRef.current.getBoundingClientRect();
        setDraggingItem({
            id: instanceId,
            type: 'lineTarget',
            offsetX: e.clientX - dropZoneRect.left, 
            offsetY: e.clientY - dropZoneRect.top,  
        });
    }, []);


    const handleGlobalMouseMove = useCallback((e) => {
        if (!draggingItem.id || !dropZoneRef.current) return;
        e.preventDefault();

        const dropZoneRect = dropZoneRef.current.getBoundingClientRect();
        
        setCurrentBlindComponents(prev => prev.map(comp => {
            if (comp.instanceId === draggingItem.id) {
                if (draggingItem.type === 'component') {
                    let newX = e.clientX - dropZoneRect.left - draggingItem.offsetX;
                    let newY = e.clientY - dropZoneRect.top - draggingItem.offsetY;
                    newX = Math.max(0, Math.min(newX, dropZoneRect.width));
                    newY = Math.max(0, Math.min(newY, dropZoneRect.height));
                    return { ...comp, x: newX, y: newY };
                } else if (draggingItem.type === 'lineTarget') {
                    let newTargetX = e.clientX - dropZoneRect.left;
                    let newTargetY = e.clientY - dropZoneRect.top;
                    newTargetX = Math.max(0, Math.min(newTargetX, dropZoneRect.width));
                    newTargetY = Math.max(0, Math.min(newTargetY, dropZoneRect.height));
                    return { ...comp, lineTargetX: newTargetX, lineTargetY: newTargetY };
                }
            }
            return comp;
        }));
    }, [draggingItem]);

    const handleGlobalMouseUp = useCallback(() => {
        setDraggingItem({ id: null, type: null, offsetX: 0, offsetY: 0 });
    }, []);

    useEffect(() => {
        if (draggingItem.id) {
            window.addEventListener('mousemove', handleGlobalMouseMove);
            window.addEventListener('mouseup', handleGlobalMouseUp);
        } else {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [draggingItem.id, handleGlobalMouseMove, handleGlobalMouseUp]);

    const handleSaveAssembly = () => {
        if (!blindName.trim()) { showNotification("Enter assembly name.", "error"); return; }
        
        setIsSavingAssembly(true);
        const newAssembly = {
            // Use crypto.randomUUID() for firestoreId for local consistency
            firestoreId: currentAssemblyId || crypto.randomUUID(), 
            name: blindName,
            components: currentBlindComponents.map(({ firestoreId, name, cost, x, y, lineTargetX, lineTargetY }) => ({ 
                firestoreId, name, cost, x, y, lineTargetX, lineTargetY 
            })),
            totalCost: totalCost,
            createdAt: new Date().toISOString(), // Keep for local data structure
            updatedAt: new Date().toISOString(),
        };

        if (currentAssemblyId) { // Update existing local assembly
            setSavedAssemblies(prev => prev.map(asm => asm.firestoreId === currentAssemblyId ? newAssembly : asm));
            showNotification(`Assembly "${blindName}" updated locally!`, 'success');
        } else { // Save new local assembly
            setCurrentAssemblyId(newAssembly.firestoreId);
            setSavedAssemblies(prev => [...prev, newAssembly]);
            showNotification(`Assembly "${blindName}" saved locally!`, 'success');
        }
        setIsSavingAssembly(false);
    };

    const handleLoadAssembly = (assemblyToLoad) => {
        setBlindName(assemblyToLoad.name);
        const dropZoneWidth = dropZoneRef.current ? dropZoneRef.current.offsetWidth : 200; 
        const dropZoneHeight = dropZoneRef.current ? dropZoneRef.current.offsetHeight : 150;

        setCurrentBlindComponents(assemblyToLoad.components.map(c => ({
            ...c, 
            instanceId: crypto.randomUUID(), // Always generate fresh instanceId for React keys
            x: c.x || 50, 
            y: c.y || 50,
            lineTargetX: c.lineTargetX || (dropZoneWidth / 2), 
            lineTargetY: c.lineTargetY || (dropZoneHeight / 2)
        })));
        setTotalCost(assemblyToLoad.totalCost);
        setCurrentAssemblyId(assemblyToLoad.firestoreId);
        showNotification(`Assembly "${assemblyToLoad.name}" loaded locally.`, 'success');
    };

    const handleNewAssembly = () => {
        setBlindName('My New Blind');
        setCurrentBlindComponents([]);
        setTotalCost(0);
        setCurrentAssemblyId(null);
        showNotification('New assembly started.', 'info');
    };
    
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    const showConfirmModal = (title, message, onConfirmAction) => {
        setConfirmModal({ isOpen: true, title, message, onConfirm: () => {
            onConfirmAction();
            setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
        }});
    };

    const handleDeleteAssembly = (idToDelete, name) => {
        showConfirmModal(`Delete: ${name}`, `Delete local assembly "${name}"?`, () => {
            setIsSavingAssembly(true); // Use this for visual feedback
            setSavedAssemblies(prev => prev.filter(asm => asm.firestoreId !== idToDelete));
            showNotification(`Local assembly "${name}" deleted.`, 'success');
            if (currentAssemblyId === idToDelete) handleNewAssembly();
            setIsSavingAssembly(false);
        });
    };
    
    const handleDeleteComponentFromLibrary = (idToDelete, name) => {
        showConfirmModal(`Delete: ${name}`, `Delete component "${name}" from local library?`, () => {
            setIsSavingComponent(true); // Use this for visual feedback
            setAvailableComponents(prev => prev.filter(comp => comp.firestoreId !== idToDelete));
            showNotification(`Local component "${name}" deleted.`, 'success');
            setIsSavingComponent(false);
        });
    };


    // No need for isAuthReady check if Firebase is removed
    // if (!isAuthReady) { ... } 

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
            {notification.message && (
                <div className={`fixed top-5 right-5 p-4 rounded-md shadow-lg text-white z-[1000]
                    ${notification.type === 'success' ? 'bg-green-500' : ''}
                    ${notification.type === 'error' ? 'bg-red-500' : ''}
                    ${notification.type === 'info' ? 'bg-blue-500' : ''}
                `}>
                    {notification.message}
                </div>
            )}

            {confirmModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1100]">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{confirmModal.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{confirmModal.message}</p>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setConfirmModal(p => ({...p, isOpen: false}))} className="px-4 py-2 text-sm rounded-md text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                            <button onClick={confirmModal.onConfirm} className="px-4 py-2 text-sm rounded-md text-white bg-red-600 hover:bg-red-700">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            <header className="mb-6">
                <h1 className="text-3xl font-bold text-center text-blue-600 dark:text-blue-400">Costing Management Module - Odidor</h1>
                {/* Removed User ID display */}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <AddComponentForm onAddComponent={handleAddComponentToLibrary} isSaving={isSavingComponent} />
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100 flex items-center"><List size={22} className="mr-2 text-gray-600 dark:text-gray-400"/> Available Components</h3>
                        {isLoadingComponents ? <p>Loading...</p> : availableComponents.length === 0 ? <p>No components. Add some!</p> : (
                            <div className="max-h-96 overflow-y-auto pr-1">
                                {availableComponents.map((c) => (
                                    <div key={c.firestoreId || c.id} className="relative group">
                                        <DraggableComponent component={c} onDragStart={handleExternalDragStart} />
                                        <button onClick={() => handleDeleteComponentFromLibrary(c.firestoreId, c.name)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-700 z-10"><Trash2 size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                            <div className="flex-grow mr-0 sm:mr-4 w-full sm:w-auto">
                                <label htmlFor="blindName" className="block text-sm font-medium">Blind Assembly Name</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input type="text" id="blindName" value={blindName} onChange={(e) => setBlindName(e.target.value)} placeholder="e.g., Kitchen Roller Blind" className="flex-1 p-2 border dark:border-gray-600 rounded-l-md dark:bg-gray-700 min-w-0"/>
                                </div>
                            </div>
                            <div className="mt-3 sm:mt-0 flex space-x-2 flex-shrink-0">
                                <button onClick={handleSaveAssembly} disabled={isSavingAssembly} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"><Package size={18} className="mr-2"/> {isSavingAssembly ? 'Saving...' : (currentAssemblyId ? 'Update Locally' : 'Save Locally')}</button>
                                <button onClick={handleNewAssembly} className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center"><PlusCircle size={18} className="mr-2"/> New</button>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold mb-3 flex items-center"><ImageIcon size={22} className="mr-2 text-blue-600 dark:text-blue-400" /> Current Blind Configuration</h3>
                        <div ref={dropZoneRef} onDragOver={handleDragOver} onDrop={handleDrop} className="relative p-0 border-2 border-dashed dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/30 overflow-hidden" style={{ minHeight: '400px', userSelect: draggingItem.id ? 'none' : 'auto' }}>
                            <BlindDiagram />
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-[5]">
                                {currentBlindComponents.map(comp => (
                                    <g key={`group-${comp.instanceId}`}>
                                        <line
                                            x1={comp.x} y1={comp.y}
                                            x2={comp.lineTargetX} y2={comp.lineTargetY}
                                            stroke={draggingItem.id === comp.instanceId && draggingItem.type === 'component' ? "rgba(2, 132, 199, 0.8)" : "rgba(100, 116, 139, 0.5)"}
                                            strokeWidth="2"
                                            strokeDasharray={draggingItem.id === comp.instanceId && draggingItem.type === 'component' ? "4 2" : "none"}
                                        />
                                        <circle
                                            cx={comp.lineTargetX} cy={comp.lineTargetY} r="6"
                                            fill={draggingItem.id === comp.instanceId && draggingItem.type === 'lineTarget' ? "rgba(165, 243, 252, 0.9)" : "rgba(14, 165, 233, 0.7)"} 
                                            stroke="rgba(8, 145, 178, 0.9)" 
                                            strokeWidth="1.5"
                                            className="cursor-move pointer-events-all" 
                                            onMouseDown={(e) => handleLineTargetDragStart(e, comp.instanceId)}
                                        />
                                        <Target size={8} x={comp.lineTargetX - 4} y={comp.lineTargetY - 4} className="text-white pointer-events-none" />
                                    </g>
                                ))}
                            </svg>

                            {currentBlindComponents.length === 0 && !draggingItem.id && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <p className="text-center text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-black/80 p-4 rounded-md">Drag components here.</p>
                                </div>
                            )}
                            {currentBlindComponents.map((comp) => (
                                <DroppedComponentItem
                                    key={comp.instanceId} component={comp}
                                    onRemove={handleRemoveComponentFromBlind}
                                    onComponentDragStart={handleComponentDragStart}
                                    isDragging={draggingItem.id === comp.instanceId && draggingItem.type === 'component'}
                                />
                            ))}
                        </div>
                        
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg shadow">
                            <h4 className="text-xl font-bold text-right text-blue-700 dark:text-blue-300">Total Cost: <span className="ml-2">${totalCost.toFixed(2)}</span></h4>
                        </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-3 flex items-center"><List size={22} className="mr-2 text-gray-600 dark:text-gray-400"/> Saved Assemblies (Local)</h3>
                        {isLoadingAssemblies ? <p>Loading...</p> : savedAssemblies.length === 0 ? <p>No assemblies saved locally.</p> : (
                            <div className="max-h-60 overflow-y-auto pr-1 space-y-2">
                                {savedAssemblies.map(asm => (
                                    <div key={asm.firestoreId} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                        <div>
                                            <span className="font-medium">{asm.name}</span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">(${parseFloat(asm.totalCost).toFixed(2)})</span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleLoadAssembly(asm)} className="p-1.5 text-blue-600 hover:text-blue-800 flex items-center text-sm"><Info size={16} className="mr-1"/> Load</button>
                                            <button onClick={() => handleDeleteAssembly(asm.firestoreId, asm.name)} className="p-1.5 text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>&copy; {new Date().getFullYear()} ERP Pricing Module. <a href="https://odidor.app" target="_blank" rel="noopener noreferrer">Odidor</a></p>
            </footer>
        </div>
    );
}

export default App;

