// pages/api/download-data.ts (or app/api/download-data/route.ts for App Router)

import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { format, data, filename } = req.query;

    if (!data || !filename || !format) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    // Decode the base64 encoded data
    const decodedData = Buffer.from(data as string, 'base64').toString('utf-8');
    
    // Set appropriate headers based on format
    let contentType = 'text/plain';
    let fileExtension = '.txt';

    switch (format) {
      case 'json':
        contentType = 'application/json';
        fileExtension = '.json';
        break;
      case 'csv':
        contentType = 'text/csv';
        fileExtension = '.csv';
        break;
      case 'pdf':
        contentType = 'application/pdf';
        fileExtension = '.pdf';
        break;
      case 'text':
      default:
        contentType = 'text/plain';
        fileExtension = '.txt';
        break;
    }

    // Ensure filename has correct extension
    const safeFilename = (filename as string).endsWith(fileExtension) 
      ? filename as string 
      : `${filename}${fileExtension}`;

    // Set headers for file download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Send the file content
    res.status(200).send(decodedData);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Error processing download' });
  }
}