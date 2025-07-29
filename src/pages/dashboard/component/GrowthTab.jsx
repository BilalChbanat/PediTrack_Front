import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Tooltip,
  IconButton,
  Alert
} from "@material-tailwind/react";
import {
  PlusIcon,
  ChartBarIcon,
  TrashIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/solid";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import axiosInstance from '@/api/axiosInstance';
import { toast } from 'react-toastify';

// Constants for BMI categories
const BMI_CATEGORIES = [
  { name: "Underweight", range: "< 18.5", color: "red", description: "BMI below healthy range, may indicate nutritional deficiencies or other health issues." },
  { name: "Normal", range: "18.5 - 24.9", color: "green", description: "Healthy weight range for most children and adults. Associated with the lowest risk of weight-related health problems." },
  { name: "Overweight", range: "25 - 29.9", color: "orange", description: "Above healthy weight range, may increase risk of health problems such as heart disease and type 2 diabetes." },
  { name: "Obese", range: "≥ 30", color: "red", description: "Significantly above healthy weight range, associated with increased risk of numerous health conditions including cardiovascular disease, stroke, and certain cancers." }
];

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return "Not recorded";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const calculateBMI = (weight, height) => {
  if (!weight || !height || weight <= 0 || height <= 0) return 0;
  const heightInMeters = height / 100;
  return (weight / (heightInMeters * heightInMeters)).toFixed(1);
};

const getBMICategory = (bmi, age) => {
  if (age < 2) return "N/A";
  if (bmi < 18.5) return "Underweight";
  if (bmi >= 18.5 && bmi < 25) return "Normal";
  if (bmi >= 25 && bmi < 30) return "Overweight";
  return "Obese";
};

const getBMICategoryColor = (category) => {
  switch (category) {
    case "Normal": return "green";
    case "Underweight": return "orange";
    case "Overweight":
    case "Obese": return "red";
    default: return "blue-gray";
  }
};

// Main component
export default function GrowthTab({
  patientId,
  patientName,
  patientAge
}) {
  // State management
  const [growthRecords, setGrowthRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    date: new Date().toISOString().split('T')[0]
  });

  // Calculated values
  const calculatedBMI = useMemo(() =>
    calculateBMI(formData.weight, formData.height),
    [formData.weight, formData.height]
  );
  
  const bmiCategory = useMemo(() =>
    getBMICategory(calculatedBMI, patientAge),
    [calculatedBMI, patientAge]
  );
  
  const isFormValid = useMemo(() =>
    formData.height && formData.weight && formData.date &&
    parseFloat(formData.height) > 0 && parseFloat(formData.weight) > 0,
    [formData]
  );

  // Chart data formatting
  const chartData = useMemo(() =>
    growthRecords.map(record => ({
      date: formatDate(record.date),
      bmi: parseFloat(record.bmi),
      height: record.heightCm,
      weight: record.weightKg,
      timestamp: new Date(record.date).getTime() // For proper sorting
    })).sort((a, b) => a.timestamp - b.timestamp),
    [growthRecords]
  );

  // Fetch growth records
  const fetchGrowthRecords = useCallback(async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/growth-records/${patientId}`);
      setGrowthRecords(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching growth records:', err);
      setError('Failed to load growth records. Please try again later.');
      toast.error('Failed to load growth records');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  // Add a new growth record
  const addGrowthRecord = useCallback(async () => {
    if (!isFormValid || loading) return;
    try {
      setLoading(true);
      const bmi = calculateBMI(formData.weight, formData.height);
      
      const payload = {
        patientId,
        heightCm: parseFloat(formData.height),
        weightKg: parseFloat(formData.weight),
        date: new Date(formData.date).toISOString(),
        bmi: parseFloat(bmi)
      };
      
      const response = await axiosInstance.post('/growth-records', payload);
      
      setGrowthRecords(prev => [...prev, response.data]);
      setModalOpen(false);
      setFormData({
        height: "",
        weight: "",
        date: new Date().toISOString().split('T')[0]
      });
      
      toast.success('Growth record added successfully!');
    } catch (err) {
      console.error('Error adding growth record:', err);
      toast.error('Failed to add growth record');
    } finally {
      setLoading(false);
    }
  }, [formData, isFormValid, loading, patientId]);

  // Delete a growth record
  const deleteGrowthRecord = useCallback(async (recordId) => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/growth-records/${recordId}`);
      setGrowthRecords(prev => prev.filter(record => record._id !== recordId));
      toast.success('Growth record deleted successfully');
    } catch (err) {
      console.error('Error deleting growth record:', err);
      toast.error('Failed to delete growth record');
    } finally {
      setLoading(false);
    }
  }, []);

  // Event handlers
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleShowCategoryInfo = useCallback((category) => {
    setSelectedCategory(category);
    setInfoModalOpen(true);
  }, []);

  const handleOpenModal = useCallback(() => {
    setFormData({
      height: "",
      weight: "",
      date: new Date().toISOString().split('T')[0]
    });
    setModalOpen(true);
  }, []);

  const exportToCsv = useCallback(() => {
    if (growthRecords.length === 0) {
      toast.warning('No data to export');
      return;
    }
    
    // Prepare CSV data
    const headers = ['Date', 'Height (cm)', 'Weight (kg)', 'BMI', 'Category'];
    const rows = growthRecords.map(record => [
      formatDate(record.date),
      record.heightCm,
      record.weightKg,
      record.bmi,
      getBMICategory(record.bmi, patientAge)
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${patientName.replace(/\s+/g, '_')}_growth_records.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Growth records exported successfully');
  }, [growthRecords, patientAge, patientName]);

  // Effects
  useEffect(() => {
    fetchGrowthRecords();
  }, [fetchGrowthRecords]);

  // Loading state
  if (loading && growthRecords.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  // Error state
  if (error && growthRecords.length === 0) {
    return (
      <div className="p-4">
        <Alert color="red" icon={<ExclamationTriangleIcon className="h-6 w-6" />}>
          {error}
        </Alert>
        <Button onClick={fetchGrowthRecords} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Typography variant="h4" color="blue-gray">
            Growth Tracking
          </Typography>
          <Typography variant="small" className="text-blue-gray-500">
            Monitor BMI and growth patterns over time
          </Typography>
        </div>
        <div className="flex gap-2">
          {growthRecords.length > 0 && (
            <Button variant="outlined" onClick={exportToCsv} className="flex items-center gap-2">
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export Data
            </Button>
          )}
          <Button variant="gradient" onClick={handleOpenModal} className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Add Growth Record
          </Button>
        </div>
      </div>

      {growthRecords.length > 0 ? (
        <>
          {/* Growth Chart */}
          <Card className="mb-6 shadow-sm">
            <CardHeader floated={false} className="p-4 bg-blue-gray-50">
              <Typography variant="h5" color="blue-gray">
                Growth Chart
              </Typography>
            </CardHeader>
            <CardBody className="p-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" label={{ value: 'BMI', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Height/Weight', angle: 90, position: 'insideRight' }} />
                    <RechartsTooltip 
                      formatter={(value, name) => {
                        if (name === "BMI") {
                          const category = getBMICategory(value, patientAge);
                          return [`${value} (${category})`, name];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="bmi" 
                      stroke="#8884d8" 
                      name="BMI" 
                      strokeWidth={2} 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="height" 
                      stroke="#82ca9d" 
                      name="Height (cm)" 
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#ffc658" 
                      name="Weight (kg)" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
          
          {/* Growth Records Table */}
          <Card className="shadow-sm mb-8">
            <CardHeader floated={false} className="p-4 bg-blue-gray-50">
              <Typography variant="h5" color="blue-gray">
                Growth Records
              </Typography>
            </CardHeader>
            <CardBody className="overflow-x-auto p-0">
              <table className="w-full min-w-max table-auto text-left">
                <thead>
                  <tr>
                    <th className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                        Date
                      </Typography>
                    </th>
                    <th className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                        Height (cm)
                      </Typography>
                    </th>
                    <th className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                        Weight (kg)
                      </Typography>
                    </th>
                    <th className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                        BMI
                      </Typography>
                    </th>
                    <th className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                        Category
                      </Typography>
                    </th>
                    <th className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                        Actions
                      </Typography>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {growthRecords
                    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date descending
                    .map((record, index) => {
                      const category = getBMICategory(record.bmi, patientAge);
                      const categoryColor = getBMICategoryColor(category);
                      
                      return (
                        <tr key={record._id || index} className="border-b border-blue-gray-50">
                          <td className="p-4">
                            <Typography variant="small" color="blue-gray" className="font-normal">
                              {formatDate(record.date)}
                            </Typography>
                          </td>
                          <td className="p-4">
                            <Typography variant="small" color="blue-gray" className="font-normal">
                              {record.heightCm}
                            </Typography>
                          </td>
                          <td className="p-4">
                            <Typography variant="small" color="blue-gray" className="font-normal">
                              {record.weightKg}
                            </Typography>
                          </td>
                          <td className="p-4">
                            <Typography variant="small" color="blue-gray" className="font-bold">
                              {record.bmi}
                            </Typography>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Chip
                                value={category}
                                color={categoryColor}
                                size="sm"
                              />
                              <Tooltip content="View category information">
                                <IconButton 
                                  variant="text" 
                                  color="blue-gray"
                                  onClick={() => handleShowCategoryInfo(BMI_CATEGORIES.find(c => c.name === category))}
                                  className="h-6 w-6 p-0"
                                >
                                  <InformationCircleIcon className="h-4 w-4" />
                                </IconButton>
                              </Tooltip>
                            </div>
                          </td>
                          <td className="p-4">
                            <Tooltip content="Delete record">
                              <IconButton 
                                variant="text" 
                                color="red"
                                onClick={() => deleteGrowthRecord(record._id)}
                                disabled={loading}
                                className="h-8 w-8"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </IconButton>
                            </Tooltip>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </CardBody>
          </Card>
          
          {/* BMI Categories Information */}
          <div className="mb-8">
            <Typography variant="h5" color="blue-gray" className="mb-4">
              BMI Categories
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {BMI_CATEGORIES.map((category, index) => (
                <Card key={index} className="border border-blue-gray-50">
                  <CardBody>
                    <div className="flex justify-between items-start">
                      <div>
                        <Typography variant="h6" color={category.color}>
                          {category.name}
                        </Typography>
                        <Typography variant="small" className="text-blue-gray-500">
                          BMI {category.range}
                        </Typography>
                      </div>
                      <Tooltip content="View details">
                        <IconButton 
                          variant="text" 
                          color="blue-gray"
                          onClick={() => handleShowCategoryInfo(category)}
                          className="h-8 w-8"
                        >
                          <InformationCircleIcon className="h-5 w-5" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
            <Typography variant="small" className="mt-4 text-blue-gray-500 italic">
              Note: BMI categories may vary for children under 2 years old. Always consult with a healthcare provider for proper assessment.
            </Typography>
          </div>
        </>
      ) : (
        // Empty state
        <div className="text-center py-16 bg-blue-gray-50/30 rounded-xl">
          <ChartBarIcon className="h-16 w-16 mx-auto text-blue-gray-300 mb-4" />
          <Typography variant="h5" color="blue-gray" className="mb-2">
            No Growth Records Found
          </Typography>
          <Typography variant="small" className="text-blue-gray-500 mb-6 max-w-md mx-auto">
            Start tracking {patientName}'s growth by adding a new record. Regular monitoring helps assess development patterns.
          </Typography>
          <Button variant="gradient" onClick={handleOpenModal}>
            Add First Growth Record
          </Button>
        </div>
      )}
      
      {/* Add Growth Record Modal */}
      <Dialog open={modalOpen} handler={() => setModalOpen(false)} size="md">
        <DialogHeader>Add Growth Record</DialogHeader>
        <DialogBody divider>
          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Height (cm)"
                type="number"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                required
                min="0"
                step="0.1"
              />
              
              <Input
                label="Weight (kg)"
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                required
                min="0"
                step="0.1"
              />
            </div>
            
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
            />
            
            {formData.height && formData.weight && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <Typography variant="h6" color="blue-gray">
                  BMI Calculation
                </Typography>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <Typography variant="small" className="font-semibold text-blue-gray-500">
                      BMI Value:
                    </Typography>
                    <Typography variant="lead">
                      {calculatedBMI}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="small" className="font-semibold text-blue-gray-500">
                      Category:
                    </Typography>
                    <Chip
                      value={bmiCategory}
                      color={getBMICategoryColor(bmiCategory)}
                      size="md"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setModalOpen(false)}
            className="mr-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="gradient" 
            color="green" 
            onClick={addGrowthRecord}
            disabled={!isFormValid || loading}
          >
            {loading ? "Adding..." : "Add Record"}
          </Button>
        </DialogFooter>
      </Dialog>
      
      {/* BMI Category Info Modal */}
      <Dialog open={infoModalOpen} handler={() => setInfoModalOpen(false)} size="xs">
        <DialogHeader>
          <Typography variant="h5" color={selectedCategory?.color}>
            {selectedCategory?.name} BMI Category
          </Typography>
        </DialogHeader>
        <DialogBody divider>
          <div className="p-2">
            <div className="mb-4">
              <Typography variant="small" className="font-semibold text-blue-gray-500">
                BMI Range:
              </Typography>
              <Typography>
                {selectedCategory?.range}
              </Typography>
            </div>
            
            <div className="mb-4">
              <Typography variant="small" className="font-semibold text-blue-gray-500">
                Description:
              </Typography>
              <Typography>
                {selectedCategory?.description}
              </Typography>
            </div>
            
            <div className="p-3 bg-blue-gray-50 rounded-lg">
              <Typography variant="small" className="italic">
                Note: BMI is one screening tool and should be considered alongside other health indicators. 
                Consult with healthcare providers for comprehensive assessment.
              </Typography>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button 
            variant="gradient" 
            color="blue-gray" 
            onClick={() => setInfoModalOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}