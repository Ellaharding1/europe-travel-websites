import React from "react";
import { Modal, Box, Typography, Button, Divider } from "@mui/material";

const PrivacyPolicyModal = ({ open, handleClose }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Box
        sx={{
          width: "90%",
          maxWidth: "800px",
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: 24,
          maxHeight: "90vh",
          overflowY: "auto", // Enable scrolling for large content
        }}
      >
        <Typography variant="h4" gutterBottom>
          Security, Privacy, and Copyright Policies
        </Typography>

        <Divider sx={{ marginY: "20px" }} />

        {/* Privacy and Security Policy */}
        <Typography variant="h5" gutterBottom>
          Privacy and Security Policy
        </Typography>
        <Typography variant="body1" paragraph>
          We are committed to safeguarding your privacy and securing your data. This Privacy Policy outlines how we collect, use, and protect the information provided by our users. We ensure that your personal information is handled with the utmost care.
        </Typography>
        <Typography variant="body2" paragraph>
          For any concerns or questions about this policy, contact us at{" "}
          <a href="mailto:support@example.com">support@example.com</a>.
        </Typography>

        <Divider sx={{ marginY: "20px" }} />

        {/* DMCA Notice and Takedown Policy */}
        <Typography variant="h5" gutterBottom>
          DMCA Notice and Takedown Policy
        </Typography>
        <Typography variant="body1" paragraph>
          If you believe that content on this platform infringes upon your copyright, you may send us a notice under the Digital Millennium Copyright Act (DMCA). Please include the following in your notice:
        </Typography>
        <ul>
          <li>Your contact information (email and phone).</li>
          <li>A description of the copyrighted work you claim has been infringed.</li>
          <li>The URL or location of the allegedly infringing content.</li>
          <li>A statement that you believe in good faith that the content is not authorized by the copyright owner.</li>
          <li>A statement under penalty of perjury that your notice is accurate.</li>
        </ul>
        <Typography variant="body2" paragraph>
          Send DMCA notices to: <a href="mailto:dmca@example.com">dmca@example.com</a>
        </Typography>

        <Divider sx={{ marginY: "20px" }} />

        {/* Acceptable Use Policy (AUP) */}
        <Typography variant="h5" gutterBottom>
          Acceptable Use Policy (AUP)
        </Typography>
        <Typography variant="body1" paragraph>
          By using our platform, you agree to comply with this Acceptable Use Policy. Violations of this policy may result in the suspension or termination of your account. Prohibited actions include, but are not limited to:
        </Typography>
        <ul>
          <li>Using the platform for unlawful purposes.</li>
          <li>Distributing malware or harmful software.</li>
          <li>Engaging in harassment or hate speech.</li>
          <li>Uploading copyrighted material without authorization.</li>
        </ul>
        <Typography variant="body2" paragraph>
          For any questions regarding the AUP, contact us at{" "}
          <a href="mailto:support@example.com">support@example.com</a>.
        </Typography>

        <Divider sx={{ marginY: "20px" }} />

        {/* Close Button */}
        <Button
          variant="contained"
          color="secondary"
          onClick={handleClose}
          sx={{ marginTop: "20px", display: "block", marginLeft: "auto" }}
        >
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default PrivacyPolicyModal;
