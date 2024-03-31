'use client'

import React, { useState } from "react";
import { reportThread } from "@/lib/actions/thread.action";
import Image from "next/image";

interface props {
    threadId: string,
    currentUserId: string,
}

const ReportIcon = ({ threadId, currentUserId }: props) => {
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const reportOptions = [
    "Inappropriate content",
    "Spam or misleading",
    "Harassment or bullying",
    "Other"
  ];

  const handleReportClick = () => {
    setShowReportForm(!showReportForm);
  };

  const handleReportSubmit = async () => {
    try {
      await reportThread(threadId, currentUserId, selectedReason);
      setSubmitted(true);
    } catch (error: any) {
      console.error("Failed to submit report:", error.message);
    }
  };

  const handleCloseReportForm = () => {
    // Reset form state
    setShowReportForm(false);
    setSelectedReason("");
    setSubmitted(false);
  };

  return (
    <div>
        <Image
          src="/assets/report.svg"
          alt="report"
          width={19}
          height={19}
          className="cursor-pointer object-contain"
          onClick={handleReportClick}
        />
      {showReportForm && (
        <div className="report-form">
          
          <p style={{ fontSize: "14px" }}>Please select a reason for reporting this post:</p>
          <select value={selectedReason} onChange={(e) => setSelectedReason(e.target.value)}>
            <option value="">Select a reason</option>
            {reportOptions.map((reason, index) => (
              <option key={index} value={reason}>{reason}</option>
            ))}
          </select>
          <div className="buttons">
            <button onClick={handleReportSubmit} className="submit-button">Submit</button>
            <button onClick={handleCloseReportForm} className="cancel-button">Cancel</button>
          </div>
        </div>
      )}
      {submitted && (
        <div className="submitted-message">
          <h2>Thank You!</h2>
          <p>Your report has been submitted.</p>
          <button onClick={handleCloseReportForm} className="close-button">Close</button>
        </div>
      )}
    </div>
  );
};

export default ReportIcon;
