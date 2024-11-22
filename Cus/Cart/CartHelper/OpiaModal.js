import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const OpiaModal = ({ isOpen, onClose, opiaData }) => {
  if (!opiaData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold mb-4">Prescription Details</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="left" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="left">Left Eye (OS)</TabsTrigger>
            <TabsTrigger value="right">Right Eye (OD)</TabsTrigger>
          </TabsList>

          <TabsContent value="left" className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Sphere (SPH)</p>
                  <p className="text-lg font-semibold">{opiaData.leftEye?.sphere || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Cylinder (CYL)</p>
                  <p className="text-lg font-semibold">{opiaData.leftEye?.cylinder || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Axis</p>
                  <p className="text-lg font-semibold">{opiaData.leftEye?.axis || 'N/A'}°</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Add</p>
                  <p className="text-lg font-semibold">{opiaData.leftEye?.add || 'N/A'}</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">PD (Pupillary Distance)</h4>
                <p className="text-lg font-semibold">{opiaData.leftEye?.pd || 'N/A'} mm</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="right" className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Sphere (SPH)</p>
                  <p className="text-lg font-semibold">{opiaData.rightEye?.sphere || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Cylinder (CYL)</p>
                  <p className="text-lg font-semibold">{opiaData.rightEye?.cylinder || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Axis</p>
                  <p className="text-lg font-semibold">{opiaData.rightEye?.axis || 'N/A'}°</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Add</p>
                  <p className="text-lg font-semibold">{opiaData.rightEye?.add || 'N/A'}</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">PD (Pupillary Distance)</h4>
                <p className="text-lg font-semibold">{opiaData.rightEye?.pd || 'N/A'} mm</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-sm text-gray-500">
          <p>Note: Please consult with your eye care professional if you notice any discrepancies in your prescription.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OpiaModal;