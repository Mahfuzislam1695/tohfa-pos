"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Plus, List, Eye, AlertTriangle, BarChart } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RemovalList } from "./removal-list";
import { RemovalForm } from "./removal-form";
import { RemovalStatistics } from "./removal-statistics";
import { RemovalDetails } from "./removal-details";

export default function Removals() {
    const [activeTab, setActiveTab] = useState("list");
    const [refreshKey, setRefreshKey] = useState(0);
    const [editingRemoval, setEditingRemoval] = useState<any>(null);
    const [viewingRemoval, setViewingRemoval] = useState<any>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

    const handleSuccess = () => {
        setRefreshKey((prev) => prev + 1);
        setActiveTab("list");
        setEditingRemoval(null);
    };

    const handleEdit = (removal: any) => {
        setEditingRemoval(removal);
        setActiveTab("add");
    };

    const handleView = (removal: any) => {
        setViewingRemoval(removal);
        setIsViewDialogOpen(true);
    };

    const handleCloseView = () => {
        setIsViewDialogOpen(false);
        setViewingRemoval(null);
    };

    const handleCancelEdit = () => {
        setEditingRemoval(null);
        setActiveTab("list");
    };

    return (
        <>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                            <AlertTriangle className="h-8 w-8 text-amber-600" />
                            Product Removal Management
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage damaged, expired, and removed inventory items
                        </p>
                    </div>
                    {activeTab === "list" && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setActiveTab("statistics")}
                                className="flex items-center gap-2"
                            >
                                <BarChart className="h-4 w-4" />
                                Statistics
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setEditingRemoval(null);
                                    setActiveTab("add");
                                }}
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Record Removal
                            </Button>
                        </div>
                    )}
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                        <TabsTrigger value="list" className="flex items-center gap-2">
                            <List className="h-4 w-4" />
                            View Removals
                        </TabsTrigger>
                        <TabsTrigger value="add" className="flex items-center gap-2">
                            {editingRemoval ? (
                                <>
                                    <Eye className="h-4 w-4" />
                                    Edit Removal
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    Record Removal
                                </>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="statistics" className="flex items-center gap-2">
                            <BarChart className="h-4 w-4" />
                            Statistics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="list" className="mt-6">
                        <RemovalList
                            key={refreshKey}
                            onEdit={handleEdit}
                            onView={handleView}
                        />
                    </TabsContent>

                    <TabsContent value="add" className="mt-6">
                        <RemovalForm
                            editItem={editingRemoval}
                            onSuccess={handleSuccess}
                            onCancel={handleCancelEdit}
                        />
                    </TabsContent>

                    <TabsContent value="statistics" className="mt-6">
                        <RemovalStatistics />
                    </TabsContent>
                </Tabs>
            </div>

            {/* View Removal Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="w-[80vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Removal Details</DialogTitle>
                    </DialogHeader>
                    {viewingRemoval && (
                        <RemovalDetails
                            removalID={viewingRemoval.removalID}
                            onClose={handleCloseView}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}