
import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Button, Input, Select, Option, CardHeader } from "@material-tailwind/react";
import { PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

const BMI_CATEGORIES_DEFAULT = [
  { name: "Insuffisance pondérale", range: "< 18.5", color: "red" },
  { name: "Poids normal", range: "18.5 - 24.9", color: "green" },
  { name: "Surpoids", range: "25 - 29.9", color: "orange" },
  { name: "Obésité", range: "≥ 30", color: "red" }
];

const COLOR_OPTIONS = [
  { value: "red", label: "Rouge" },
  { value: "orange", label: "Orange" },
  { value: "amber", label: "Ambre" },
  { value: "yellow", label: "Jaune" },
  { value: "lime", label: "Lime" },
  { value: "green", label: "Vert" },
  { value: "emerald", label: "Émeraude" },
  { value: "teal", label: "Sarcelle" },
  { value: "cyan", label: "Cyan" },
  { value: "sky", label: "Bleu ciel" },
  { value: "blue", label: "Bleu" },
  { value: "indigo", label: "Indigo" },
  { value: "violet", label: "Violet" },
  { value: "purple", label: "Pourpre" },
  { value: "fuchsia", label: "Fuchsia" },
  { value: "pink", label: "Rose" },
  { value: "rose", label: "Rosé" },
];

const BMICategoryEditor = () => {
  const [bmiCategories, setBmiCategories] = useState(BMI_CATEGORIES_DEFAULT);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategories, setEditingCategories] = useState([...bmiCategories]);

  // Load categories from localStorage on component mount
  useEffect(() => {
    const savedCategories = localStorage.getItem('bmiCategories');
    if (savedCategories) {
      try {
        const parsedCategories = JSON.parse(savedCategories);
        setBmiCategories(parsedCategories);
        setEditingCategories([...parsedCategories]);
      } catch (error) {
        console.error('Failed to parse saved BMI categories', error);
        // If parsing fails, use defaults and clear the invalid data
        localStorage.removeItem('bmiCategories');
      }
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditingCategories([...bmiCategories]);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingCategories([...bmiCategories]);
  };

  const handleSave = () => {
    // Save to state
    setBmiCategories([...editingCategories]);
    
    // Save to localStorage
    localStorage.setItem('bmiCategories', JSON.stringify(editingCategories));
    
    setIsEditing(false);
  };

  const handleCategoryChange = (index, field, value) => {
    const updated = [...editingCategories];
    updated[index] = { ...updated[index], [field]: value };
    setEditingCategories(updated);
  };

  const resetToDefault = () => {
    setBmiCategories([...BMI_CATEGORIES_DEFAULT]);
    setEditingCategories([...BMI_CATEGORIES_DEFAULT]);
    // Remove from localStorage to use defaults
    localStorage.removeItem('bmiCategories');
    setIsEditing(false);
  };

  const getColorClass = (color) => {
    const colorMap = {
      red: 'text-red-600',
      orange: 'text-orange-600',
      amber: 'text-amber-600',
      yellow: 'text-yellow-600',
      lime: 'text-lime-600',
      green: 'text-green-600',
      emerald: 'text-emerald-600',
      teal: 'text-teal-600',
      cyan: 'text-cyan-600',
      sky: 'text-sky-600',
      blue: 'text-blue-600',
      indigo: 'text-indigo-600',
      violet: 'text-violet-600',
      purple: 'text-purple-600',
      fuchsia: 'text-fuchsia-600',
      pink: 'text-pink-600',
      rose: 'text-rose-600'
    };
    return colorMap[color] || 'text-blue-gray-600';
  };

  const getColorDot = (color) => {
    const colorMap = {
      red: 'bg-red-500',
      orange: 'bg-orange-500',
      amber: 'bg-amber-500',
      yellow: 'bg-yellow-500',
      lime: 'bg-lime-500',
      green: 'bg-green-500',
      emerald: 'bg-emerald-500',
      teal: 'bg-teal-500',
      cyan: 'bg-cyan-500',
      sky: 'bg-sky-500',
      blue: 'bg-blue-500',
      indigo: 'bg-indigo-500',
      violet: 'bg-violet-500',
      purple: 'bg-purple-500',
      fuchsia: 'bg-fuchsia-500',
      pink: 'bg-pink-500',
      rose: 'bg-rose-500'
    };
    return colorMap[color] || 'bg-blue-gray-500';
  };

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-gray-100 mb-6">
        <CardHeader variant="gradient" color="gray" className="mb-6 p-6">
          <Typography variant="h6" color="white">
            Catégories IMC
          </Typography>
        </CardHeader>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <Typography variant="small" className="text-blue-gray-600">
              Personnalisez les catégories d'indice de masse corporelle
            </Typography>
            
            {!isEditing ? (
              <Button 
                variant="outlined" 
                color="gray" 
                size="sm" 
                onClick={handleEdit}
                className="flex items-center gap-2"
              >
                <PencilIcon className="h-4 w-4" />
                Personnaliser
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outlined" 
                  color="red" 
                  size="sm" 
                  onClick={handleCancel}
                  className="flex items-center gap-2"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Annuler
                </Button>
                <Button 
                  variant="filled" 
                  color="green" 
                  size="sm" 
                  onClick={handleSave}
                  className="flex items-center gap-2"
                >
                  <CheckIcon className="h-4 w-4" />
                  Enregistrer
                </Button>
              </div>
            )}
          </div>
          
          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {isEditing ? (
              // Editing Mode
              editingCategories.map((category, index) => (
                <Card key={index} className="border border-blue-gray-200 shadow-sm">
                  <CardBody className="p-4 space-y-4">
                    <div>
                      <Typography variant="small" className="mb-2 text-blue-gray-700 font-medium">
                        Nom de la catégorie
                      </Typography>
                      <Input
                        value={category.name}
                        onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                        size="sm"
                        className="!border-blue-gray-200 focus:!border-blue-500"
                        labelProps={{
                          className: "before:content-none after:content-none",
                        }}
                      />
                    </div>
                    
                    <div>
                      <Typography variant="small" className="mb-2 text-blue-gray-700 font-medium">
                        Plage IMC
                      </Typography>
                      <Input
                        value={category.range}
                        onChange={(e) => handleCategoryChange(index, 'range', e.target.value)}
                        size="sm"
                        className="!border-blue-gray-200 focus:!border-blue-500"
                        labelProps={{
                          className: "before:content-none after:content-none",
                        }}
                      />
                    </div>
                    
                    <div>
                      <Typography variant="small" className="mb-2 text-blue-gray-700 font-medium">
                        Couleur
                      </Typography>
                      <Select
                        value={category.color}
                        onChange={(value) => handleCategoryChange(index, 'color', value)}
                        size="sm"
                        className="!border-blue-gray-200"
                        labelProps={{
                          className: "before:content-none after:content-none",
                        }}
                      >
                        {COLOR_OPTIONS.map((color) => (
                          <Option key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div 
                                className={`w-4 h-4 rounded-full ${getColorDot(color.value)}`}
                              />
                              {color.label}
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </CardBody>
                </Card>
              ))
            ) : (
              // Display Mode
              bmiCategories.map((category, index) => (
                <Card key={index} className="border border-blue-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardBody className="p-4 text-center">
                    <div className={`w-8 h-8 ${getColorDot(category.color)} rounded-full mx-auto mb-3`} />
                    <Typography variant="h6" className={`${getColorClass(category.color)} mb-1 font-semibold`}>
                      {category.name}
                    </Typography>
                    <Typography variant="small" className="text-blue-gray-500">
                      IMC {category.range}
                    </Typography>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
          
          {/* Reset Button - Only shown in editing mode */}
          {isEditing && (
            <div className="flex justify-end mb-4">
              <Button 
                variant="text" 
                color="blue" 
                size="sm" 
                onClick={resetToDefault}
                className="font-normal"
              >
                Réinitialiser aux valeurs par défaut
              </Button>
            </div>
          )}
          
          {/* Note */}
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <Typography variant="small" className="text-blue-gray-600 flex items-start gap-2">
              <span className="text-blue-500 font-semibold">Note :</span>
              Les catégories IMC peuvent varier pour les enfants de moins de 2 ans. Consultez toujours un professionnel de santé pour une évaluation personnalisée.
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BMICategoryEditor;


// import React, { useState, useEffect } from 'react';
// import { Card, CardBody, Typography, Button, Input, Select, Option } from "@material-tailwind/react";
// import { PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

// const BMI_CATEGORIES_DEFAULT = [
//   { name: "Insuffisance pondérale", range: "< 18.5", color: "red" },
//   { name: "Poids normal", range: "18.5 - 24.9", color: "green" },
//   { name: "Surpoids", range: "25 - 29.9", color: "orange" },
//   { name: "Obésité", range: "≥ 30", color: "red" }
// ];

// const COLOR_OPTIONS = [
//   { value: "red", label: "Rouge" },
//   { value: "orange", label: "Orange" },
//   { value: "amber", label: "Ambre" },
//   { value: "yellow", label: "Jaune" },
//   { value: "lime", label: "Lime" },
//   { value: "green", label: "Vert" },
//   { value: "emerald", label: "Émeraude" },
//   { value: "teal", label: "Sarcelle" },
//   { value: "cyan", label: "Cyan" },
//   { value: "sky", label: "Bleu ciel" },
//   { value: "blue", label: "Bleu" },
//   { value: "indigo", label: "Indigo" },
//   { value: "violet", label: "Violet" },
//   { value: "purple", label: "Pourpre" },
//   { value: "fuchsia", label: "Fuchsia" },
//   { value: "pink", label: "Rose" },
//   { value: "rose", label: "Rosé" },
// ];

// const BMICategoryEditor = () => {
//   // Charger les catégories depuis le stockage local ou utiliser les valeurs par défaut
//   const [bmiCategories, setBmiCategories] = useState(() => {
//     const savedCategories = localStorage.getItem('bmiCategories');
//     return savedCategories ? JSON.parse(savedCategories) : BMI_CATEGORIES_DEFAULT;
//   });
  
//   const [isEditing, setIsEditing] = useState(false);
//   const [editingCategories, setEditingCategories] = useState([...bmiCategories]);

//   // Sauvegarder dans le stockage local quand les catégories changent
//   useEffect(() => {
//     localStorage.setItem('bmiCategories', JSON.stringify(bmiCategories));
//   }, [bmiCategories]);

//   const handleEdit = () => {
//     setIsEditing(true);
//     setEditingCategories([...bmiCategories]);
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//     setEditingCategories([...bmiCategories]);
//   };

//   const handleSave = () => {
//     setBmiCategories([...editingCategories]);
//     setIsEditing(false);
//   };

//   const handleCategoryChange = (index, field, value) => {
//     const updated = [...editingCategories];
//     updated[index] = { ...updated[index], [field]: value };
//     setEditingCategories(updated);
//   };

//   const resetToDefault = () => {
//     setBmiCategories([...BMI_CATEGORIES_DEFAULT]);
//     setIsEditing(false);
//   };

//   return (
//     <div className="mt-8">
//       <div className="flex justify-between items-center mb-4">
//         <Typography variant="h5" color="blue-gray">
//           Catégories IMC
//         </Typography>
        
//         {!isEditing ? (
//           <Button variant="outlined" color="blue" size="sm" onClick={handleEdit}>
//             <PencilIcon className="h-4 w-4 mr-1" />
//             Personnaliser
//           </Button>
//         ) : (
//           <div className="flex gap-2">
//             <Button variant="outlined" color="red" size="sm" onClick={handleCancel}>
//               <XMarkIcon className="h-4 w-4 mr-1" />
//               Annuler
//             </Button>
//             <Button variant="filled" color="green" size="sm" onClick={handleSave}>
//               <CheckIcon className="h-4 w-4 mr-1" />
//               Enregistrer
//             </Button>
//           </div>
//         )}
//       </div>
      
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
//         {isEditing ? (
//           // Mode édition
//           editingCategories.map((category, index) => (
//             <Card key={index} className="border border-blue-gray-100 bg-blue-gray-50/50">
//               <CardBody className="p-4 space-y-3">
//                 <div>
//                   <Typography variant="small" className="mb-1 text-blue-gray-600">
//                     Nom de la catégorie
//                   </Typography>
//                   <Input
//                     value={category.name}
//                     onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
//                     size="sm"
//                     labelProps={{ className: "hidden" }}
//                   />
//                 </div>
                
//                 <div>
//                   <Typography variant="small" className="mb-1 text-blue-gray-600">
//                     Plage IMC
//                   </Typography>
//                   <Input
//                     value={category.range}
//                     onChange={(e) => handleCategoryChange(index, 'range', e.target.value)}
//                     size="sm"
//                     labelProps={{ className: "hidden" }}
//                   />
//                 </div>
                
//                 <div>
//                   <Typography variant="small" className="mb-1 text-blue-gray-600">
//                     Couleur
//                   </Typography>
//                   <Select
//                     value={category.color}
//                     onChange={(value) => handleCategoryChange(index, 'color', value)}
//                     size="sm"
//                     labelProps={{ className: "hidden" }}
//                   >
//                     {COLOR_OPTIONS.map((color) => (
//                       <Option key={color.value} value={color.value}>
//                         <div className="flex items-center gap-2">
//                           <div 
//                             className="w-4 h-4 rounded-full" 
//                             style={{ backgroundColor: `var(--${color.value}-500)` }}
//                           ></div>
//                           {color.label}
//                         </div>
//                       </Option>
//                     ))}
//                   </Select>
//                 </div>
//               </CardBody>
//             </Card>
//           ))
//         ) : (
//           // Mode affichage
//           bmiCategories.map((category, index) => (
//             <Card key={index} className="border border-blue-gray-50 transition-all hover:shadow-md">
//               <CardBody className="p-4">
//                 <Typography variant="h6" className={`text-${category.color}-600`}>
//                   {category.name}
//                 </Typography>
//                 <Typography variant="small" className="text-blue-gray-500">
//                   IMC {category.range}
//                 </Typography>
//               </CardBody>
//             </Card>
//           ))
//         )}
//       </div>
      
//       {isEditing && (
//         <div className="flex justify-end mb-4">
//           <Button variant="text" color="blue" size="sm" onClick={resetToDefault}>
//             Réinitialiser aux valeurs par défaut
//           </Button>
//         </div>
//       )}
      
//       <Typography variant="small" className="text-blue-gray-500 italic">
//         Note : Les catégories IMC peuvent varier pour les enfants de moins de 2 ans
//       </Typography>
//     </div>
//   );
// };

// export default BMICategoryEditor;