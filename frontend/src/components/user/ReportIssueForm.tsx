import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MapPin, Upload, X, CheckCircle } from 'lucide-react';
import { categories, categoryLabels } from '../../data/mockData';
import { issuesApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface ReportData {
  title: string;
  description: string;
  category: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  isAnonymous: boolean;
}

const schema = yup.object({
  title: yup.string().required('Title is required').min(10, 'Title must be at least 10 characters'),
  description: yup.string().required('Description is required').min(20, 'Description must be at least 20 characters'),
  category: yup.string().required('Please select a category'),
  location: yup.object({
    latitude: yup.number().required('Latitude is required').min(-90).max(90),
    longitude: yup.number().required('Longitude is required').min(-180).max(180),
    address: yup.string().required('Address is required').min(10, 'Please enter a complete address')
  }).required('Location is required'),
  isAnonymous: yup.boolean().default(false)
});

const ReportIssueForm: React.FC = () => {
  const { user } = useAuth();
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [useGPS, setUseGPS] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ReportData>({
    resolver: yupResolver(schema),
    defaultValues: {
      isAnonymous: false
    }
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Create preview URLs for immediate display
    const newPreviewUrls: string[] = [];
    const newFiles: File[] = [];
    
    for (const file of files) {
      if (images.length + newPreviewUrls.length < 5) {
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        newPreviewUrls.push(previewUrl);
        newFiles.push(file);
      }
    }
    
    setImages(prev => [...prev, ...newPreviewUrls]);
    setImageFiles(prev => [...prev, ...newFiles]);
  };

  const removeImage = (index: number) => {
    // Revoke the object URL to free memory
    if (images[index].startsWith('blob:')) {
      URL.revokeObjectURL(images[index]);
    }
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = () => {
    setUseGPS(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Reverse geocoding to get address
            const response = await fetch(
              `https://api.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            const address = data.display_name || `${latitude}, ${longitude}`;
            
            setValue('location.latitude', latitude);
            setValue('location.longitude', longitude);
            setValue('location.address', address);
          } catch (error) {
            console.error('Error getting address:', error);
            setValue('location.latitude', latitude);
            setValue('location.longitude', longitude);
            setValue('location.address', `${latitude}, ${longitude}`);
          } finally {
            setUseGPS(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setUseGPS(false);
        }
      );
    } else {
      setUseGPS(false);
    }
  };

  const onSubmit = async (data: ReportData) => {
    console.log('Form submitted with data:', data);
    
    if (!user) {
      console.error('User not authenticated:', user);
      alert('Please log in to submit a report');
      return;
    }

    console.log('User authenticated:', user.id);
    setIsSubmitting(true);
    
    try {
      // Upload images first if any
      let uploadedImageUrls: string[] = [];
      
      if (imageFiles.length > 0) {
        console.log('Uploading images:', imageFiles.length);
        const fileList = new DataTransfer();
        imageFiles.forEach(file => fileList.items.add(file));
        
        const uploadResponse = await issuesApi.uploadImages(fileList.files);
        
        if (uploadResponse.success) {
          uploadedImageUrls = uploadResponse.data.imageUrls;
          console.log('Images uploaded successfully:', uploadedImageUrls);
        } else {
          console.error('Image upload failed:', uploadResponse.message);
          // Continue without images
        }
      }

      const issueData = {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: 'medium', // Default priority
        location: {
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          address: data.location.address
        },
        images: uploadedImageUrls, // Use uploaded image URLs
        tags: [], // Empty for now
        isPublic: !data.isAnonymous,
        reportedBy: user.id
      };

      console.log('Sending issue data:', issueData);

      const response = await issuesApi.createIssue(issueData);
      
      console.log('API Response:', response);
      
      if (response.success) {
        setSubmitted(true);
        // Reset form after successful submission
        setTimeout(() => {
          setSubmitted(false);
          reset();
          // Clean up image URLs and files
          images.forEach(url => {
            if (url.startsWith('blob:')) {
              URL.revokeObjectURL(url);
            }
          });
          setImages([]);
          setImageFiles([]);
        }, 3000);
      } else {
        console.error('Failed to create issue:', response.message);
        alert(`Error: ${response.message || 'Failed to create issue'}`);
      }
    } catch (error) {
      console.error('Error creating issue:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">Report Submitted Successfully!</h2>
          <p className="text-green-700">
            Your issue has been reported and assigned ID #RT{Date.now()}. 
            You can track its progress in your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Report an Issue</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Issue Title *
            </label>
            <input
              {...register('title')}
              type="text"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Brief description of the issue"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              {...register('category')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.category ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Provide detailed information about the issue"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Location *</h3>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={useGPS}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
              >
                <MapPin className="w-4 h-4" />
                {useGPS ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Getting...</span>
                  </>
                ) : (
                  <span>Use Current Location</span>
                )}
              </button>
            </div>
            
            <p className="text-xs text-gray-600">
              We need your exact location to ensure you can only report issues within 5km of your area.
            </p>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                {...register('location.address')}
                rows={2}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.location?.address ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your complete address"
              />
              {errors.location?.address && (
                <p className="mt-1 text-sm text-red-600">{errors.location.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  {...register('location.latitude', { valueAsNumber: true })}
                  type="number"
                  step="any"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.location?.latitude ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 40.7128"
                />
                {errors.location?.latitude && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.latitude.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  {...register('location.longitude', { valueAsNumber: true })}
                  type="number"
                  step="any"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.location?.longitude ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., -74.0060"
                />
                {errors.location?.longitude && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.longitude.message}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images (Optional - Max 5) - Currently for preview only
            </label>
            <div className="text-xs text-orange-600 mb-2">
              Note: Image upload to server is not yet implemented. Images are shown for preview but won't be saved.
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={images.length >= 5}
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer flex flex-col items-center ${
                  images.length >= 5 ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {images.length >= 5 ? 'Maximum images reached' : 'Click to upload or drag and drop'}
                </span>
              </label>
            </div>

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              {...register('isAnonymous')}
              type="checkbox"
              id="isAnonymous"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isAnonymous" className="ml-2 text-sm text-gray-700">
              Submit anonymously (your name won't be displayed)
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !user}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {!user ? (
              'Please log in to submit'
            ) : isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Submitting Report...
              </div>
            ) : (
              'Submit Report'
            )}
          </button>
          
          {/* Debug info */}
          {!user && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Debug:</strong> User not logged in. Please login first.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ReportIssueForm;