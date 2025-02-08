import { useEffect, useState } from 'react';
import { GetAllSampleCVWithoutPage } from '@/api/sampleCVService'; // Assume API function is working
import RootLayout from '@/app/layout';
import Header from '@/components/Header';
import { Button, Card, CardContent, Typography, Box, Collapse } from '@mui/material';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import * as pdfjs from 'pdfjs-dist'; // Import pdfjs

const SampleCVPage = () => {
  const [cvTemplates, setCvTemplates] = useState<any[]>([]);

  useEffect(() => {
    const fetchCVTemplates = async () => {
      try {
        const response: any = await GetAllSampleCVWithoutPage();
        setCvTemplates(response.cvTemplates);
      } catch (error) {
        console.error('Error fetching CV templates:', error);
      }
    };

    fetchCVTemplates();
  }, []);

  return (
    <RootLayout>
      <Header /> 
      <Box sx={{ padding: 4 }}> 
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 3,
            paddingBottom: 4,
          }}
        >
          {cvTemplates.map((cv) => (
            <Card key={cv.sampleID} sx={{ maxWidth: 345, boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography className='font-semibold' variant="h6" component="div" gutterBottom>
                  {cv.title}
                </Typography>

                {/* Truncated Description with "Read More" functionality */}
                <Typography variant="body2" color="text.secondary" paragraph>
                  {cv.description.length > 100 ? `${cv.description.slice(0, 100)}...` : cv.description}
                </Typography>

                {/* Collapse component to toggle full description */}
                {cv.description.length > 100 && (
                  <Box>
                    <Collapse in={cv.showFullDescription}>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {cv.description}
                      </Typography>
                    </Collapse>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => {
                        const updatedCVTemplates = [...cvTemplates];
                        const cvIndex = updatedCVTemplates.findIndex(item => item.sampleID === cv.sampleID);
                        updatedCVTemplates[cvIndex].showFullDescription = !cv.showFullDescription;
                        setCvTemplates(updatedCVTemplates);
                      }}
                    >
                      {cv.showFullDescription ? 'Read Less' : 'Read More'}
                    </Button>
                  </Box>
                )}

                {/* Display PDF */}
                <Box sx={{ height: '400px', marginBottom: 2 }}>
                  <Worker workerUrl={`https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`}>
                    <Viewer 
                      fileUrl={`http://localhost:5037/api/${cv.fileCV}`}
                      renderError={(error) => (
                        <Typography variant="body2" color="error" align="center">
                          Error loading PDF: {error.message}
                        </Typography>
                      )}
                    />
                  </Worker>
                </Box>

                {/* Link to download CV */}
                <Button
                  href={`http://localhost:5037/${cv.fileCV}`}
                  target="_blank"
                  variant="contained"
                  className="bg-primary-color"
                  fullWidth
                  sx={{
                    '&:hover': {
                      backgroundColor: '#1976d2',
                    },
                  }}
                >
                  Download CV
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </RootLayout>
  );
};

export default SampleCVPage;
