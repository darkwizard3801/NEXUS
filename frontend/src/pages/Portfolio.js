import React, { useState, useEffect } from 'react';
import { FiUploadCloud, FiX } from 'react-icons/fi';
import SummaryApi from '../common';
import { toast } from 'react-toastify';

const Portfolio = () => {
  const [aboutFile, setAboutFile] = useState(null);
  const [portfolioFiles, setPortfolioFiles] = useState([]);
  const [location, setLocation] = useState('');
  const [tagline, setTagline] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [existingAboutFile, setExistingAboutFile] = useState(null);
  const [existingPortfolioEvents, setExistingPortfolioEvents] = useState([]);
  const [expandedEvent, setExpandedEvent] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(SummaryApi.current_user.url, {
        method: SummaryApi.current_user.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const userData = await response.json();
      setUserEmail(userData.data.email);
      if (userData.data.email) {
        fetchPortfolioData(userData.data.email);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  // Function to convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        const base64String = fileReader.result;
        // Remove the data:mime/type;base64, prefix
        const base64Data = base64String.split(',')[1];
        resolve({
          data: base64Data,
          contentType: file.type
        });
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let aboutFileData = null;
      let portfolioFilesData = [];

      // Convert about file to base64 if it exists
      if (aboutFile?.file) {
        aboutFileData = await convertToBase64(aboutFile.file);
      }

      // Convert portfolio files to base64
      if (portfolioFiles.length > 0) {
        portfolioFilesData = await Promise.all(
          portfolioFiles.map(fileObj => convertToBase64(fileObj.file))
        );
      }

      const payload = {
        userEmail,
        tagline,
        aboutText,
        location,
        aboutFile: aboutFileData,
        portfolioFiles: portfolioFilesData
      };

      const response = await fetch(SummaryApi.portfolio.url, {
        method: SummaryApi.portfolio.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit portfolio');
      }

      const result = await response.json();
      toast.success(result.message);
      await fetchPortfolioData(userEmail);
      
      // Reset file inputs only
      setAboutFile(null);
      setPortfolioFiles([]);
    } catch (error) {
      console.error('Error submitting portfolio:', error);
      alert('Failed to submit portfolio. Please try again.');
    }
  };

  const fetchPortfolioData = async (email) => {
    try {
      const response = await fetch(SummaryApi.get_portfolio.url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: email }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio data');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setTagline(result.data.tagline || '');
        setAboutText(result.data.aboutText || '');
        setExistingAboutFile(result.data.aboutFile || null);
        setExistingPortfolioEvents(result.data.portfolioEvents || []);
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    }
  };

  // Function to handle about file change
  const handleAboutFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setAboutFile({
        file,
        preview: URL.createObjectURL(file)
      });
    }
  };

  // Function to handle portfolio files change
  const handlePortfolioFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const filesWithPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setPortfolioFiles(filesWithPreviews);
  };

  // Function to remove about file
  const removeAboutFile = () => {
    if (aboutFile?.preview) {
      URL.revokeObjectURL(aboutFile.preview);
    }
    setAboutFile(null);
  };

  // Function to remove portfolio file
  const removePortfolioFile = (index) => {
    if (portfolioFiles[index]?.preview) {
      URL.revokeObjectURL(portfolioFiles[index].preview);
    }
    setPortfolioFiles(portfolioFiles.filter((_, i) => i !== index));
  };

  // Sort events by event number in descending order (newest first)
  const sortedEvents = [...existingPortfolioEvents].sort((a, b) => 
    b.eventNumber - a.eventNumber
  );

  // Group events into pairs for the grid layout
  const eventPairs = [];
  for (let i = 0; i < sortedEvents.length; i += 2) {
    eventPairs.push(sortedEvents.slice(i, i + 2));
  }

  // Helper function to render media with consistent sizing
  const renderMedia = (file) => {
    if (file.contentType?.startsWith('video/')) {
      return (
        <video 
          className="w-full h-full object-cover" 
          controls
          onClick={(e) => e.stopPropagation()}
        >
          <source src={`data:${file.contentType};base64,${file.data}`} type={file.contentType} />
        </video>
      );
    } else {
      return (
        <img 
          src={`data:${file.contentType};base64,${file.data}`}
          alt="Media" 
          className="w-full h-full object-cover"
        />
      );
    }
  };

  const toggleEventExpansion = (eventNumber) => {
    setExpandedEvent(expandedEvent === eventNumber ? null : eventNumber);
  };

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      if (aboutFile?.preview) {
        URL.revokeObjectURL(aboutFile.preview);
      }
      portfolioFiles.forEach(fileObj => {
        if (fileObj.preview) {
          URL.revokeObjectURL(fileObj.preview);
        }
      });
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-3xl my-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-semibold mb-2">Tagline:</label>
            <input 
              type="text" 
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Enter your tagline" 
              className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          
          <div>
            <label className="block text-lg font-semibold mb-2">About Us:</label>
            <div className="flex gap-4">
              <div className="w-[30%]">
                <input 
                  type="file" 
                  onChange={handleAboutFileChange} 
                  className="hidden" 
                  id="aboutFile" 
                  accept="image/*,video/*,.gif"
                />
                <label htmlFor="aboutFile" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUploadCloud className="w-10 h-10 text-gray-500 mb-2" />
                    <p className="text-sm text-gray-500 text-center">Upload image, video, or GIF</p>
                  </div>
                </label>
                
                {aboutFile && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="relative group w-24 h-24 flex-shrink-0">
                        {aboutFile.file.type.startsWith('image/') ? (
                          <img 
                            src={aboutFile.preview} 
                            alt="Preview" 
                            className="w-full h-full object-cover rounded-lg" 
                          />
                        ) : (
                          <video className="w-full h-full object-cover rounded-lg">
                            <source src={aboutFile.preview} type={aboutFile.file.type} />
                          </video>
                        )}
                        <button
                          type="button"
                          onClick={removeAboutFile}
                          className="absolute inset-0 bg-black bg-opacity-50 rounded-lg hidden group-hover:flex items-center justify-center"
                        >
                          <FiX className="w-6 h-6 text-white" />
                        </button>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{aboutFile.file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(aboutFile.file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!aboutFile && existingAboutFile && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-24 h-24 flex-shrink-0">
                        {existingAboutFile.contentType?.startsWith('video/') ? (
                          <video className="w-full h-full object-cover rounded-lg" controls>
                            <source 
                              src={`data:${existingAboutFile.contentType};base64,${existingAboutFile.data}`} 
                              type={existingAboutFile.contentType} 
                            />
                          </video>
                        ) : (
                          <img 
                            src={`data:${existingAboutFile.contentType};base64,${existingAboutFile.data}`}
                            alt="Existing About" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Current File</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="w-[70%]">
                <textarea 
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  placeholder="Write about your company..." 
                  className="border rounded-md p-2 w-full h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold mb-2">Portfolio:</label>
            
            {/* Portfolio Upload Section */}
            <div className="space-y-4 mb-6">
              <input 
                type="file" 
                onChange={handlePortfolioFileChange} 
                className="hidden" 
                id="portfolioFile" 
                accept="image/*,video/*,.gif"
                multiple
              />
              <label htmlFor="portfolioFile" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FiUploadCloud className="w-10 h-10 text-gray-500 mb-2" />
                  <p className="text-sm text-gray-500">Upload multiple images, videos, or GIFs</p>
                </div>
              </label>

              {portfolioFiles.length > 0 && (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter event location"
                    className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    {portfolioFiles.map((fileObj, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded-lg">
                        <div className="space-y-2">
                          <div className="relative group w-full pt-[100%]">
                            <div className="absolute inset-0">
                              {fileObj.file.type.startsWith('image/') ? (
                                <img 
                                  src={fileObj.preview} 
                                  alt="Preview" 
                                  className="w-full h-full object-cover rounded-lg" 
                                />
                              ) : (
                                <video className="w-full h-full object-cover rounded-lg">
                                  <source src={fileObj.preview} type={fileObj.file.type} />
                                </video>
                              )}
                              <button
                                type="button"
                                onClick={() => removePortfolioFile(index)}
                                className="absolute inset-0 bg-black bg-opacity-50 rounded-lg hidden group-hover:flex items-center justify-center"
                              >
                                <FiX className="w-6 h-6 text-white" />
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium truncate">
                              {fileObj.file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(fileObj.file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Existing Portfolio Events */}
            <div className="space-y-6">
              {eventPairs.map((pair, pairIndex) => (
                <div key={pairIndex} className="grid grid-cols-2 gap-6">
                  {pair.map((event) => (
                    <div 
                      key={event.eventNumber} 
                      className={`transition-all duration-500 ${
                        expandedEvent === event.eventNumber ? 'col-span-2' : 'col-span-1'
                      }`}
                    >
                      <h3 className="text-black dark:text-white text-lg font-medium mb-2">
                        Event {event.eventNumber}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">
                        Location: {event.location} • {new Date(event.createdAt).toLocaleString()}
                      </p>
                      <div 
                        className={`relative transition-all duration-500 ease-in-out ${
                          expandedEvent === event.eventNumber 
                            ? 'h-auto grid grid-cols-3 gap-4 px-4' 
                            : 'h-[200px] flex items-center mb-8 ml-8'
                        }`}
                      >
                        {event.files.map((file, fileIndex) => (
                          <div 
                            key={fileIndex} 
                            className={`
                              ${expandedEvent === event.eventNumber 
                                ? 'relative w-full h-[180px] cursor-pointer transform-none hover:scale-105 mb-4'
                                : 'absolute w-[150px] h-[150px] cursor-pointer'
                              }
                              bg-gray-50 dark:bg-gray-700 rounded-lg shadow-lg 
                              transition-all duration-500 ease-in-out
                              hover:z-10
                            `}
                            style={{
                              transform: expandedEvent === event.eventNumber 
                                ? 'none' 
                                : `rotate(${fileIndex * 10}deg)`,
                              zIndex: expandedEvent === event.eventNumber ? 0 : fileIndex,
                              transformOrigin: 'center 110%',
                              left: expandedEvent === event.eventNumber ? 'auto' : '20px'
                            }}
                            onClick={() => toggleEventExpansion(event.eventNumber)}
                          >
                            <div className={`
                              w-full h-full overflow-hidden rounded-lg
                              transition-transform duration-500
                              ${expandedEvent === event.eventNumber ? 'scale-100' : 'scale-100'}
                            `}>
                              {renderMedia(file)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:ring-offset-gray-800"
          >
            Submit Portfolio
          </button>
        </form>
      </div>
    </div>
  );
};

export default Portfolio;
