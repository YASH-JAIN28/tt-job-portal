import React, { useMemo, useRef, useState } from 'react';
import JobSummary from './Resume';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FaDownload, FaSearch, FaMapMarkerAlt, FaBriefcase } from 'react-icons/fa';

const jobPostings = [
  {
    id: 1,
    title: 'Cloud DevOps Engineer',
    company: 'Skyline Recruit',
    location: 'Bengaluru, India',
    type: 'Full Time',
    salary: '₹12 LPA',
    posted: '1 day ago',
    skills: ['AWS', 'Terraform', 'Docker', 'Kubernetes'],
    description:
      'Design and implement automated cloud infrastructure pipelines, manage container orchestration, and improve deployment reliability for distributed recruitment services.',
    requirements: ['AWS architecture', 'Infrastructure as Code', 'CI/CD automation', 'Kubernetes operations'],
    matchTags: ['Cloud', 'CI/CD', 'Infrastructure', 'Automation']
  },
  {
    id: 2,
    title: 'Site Reliability Engineer',
    company: 'NimbusOps',
    location: 'Remote',
    type: 'Remote',
    salary: '₹14 LPA',
    posted: '2 days ago',
    skills: ['Prometheus', 'Grafana', 'Linux', 'Terraform'],
    description:
      'Maintain high availability for SaaS recruitment platforms, implement observability, and automate incident response across cloud infrastructure.',
    requirements: ['SRE practices', 'monitoring and alerting', 'cloud reliability', 'IaC'],
    matchTags: ['Reliability', 'Monitoring', 'Cloud', 'Automation']
  },
  {
    id: 3,
    title: 'Cloud Infrastructure Architect',
    company: 'TalentBridge',
    location: 'Hyderabad, India',
    type: 'Full Time',
    salary: '₹18 LPA',
    posted: '3 days ago',
    skills: ['AWS', 'Azure', 'Architecture', 'Security'],
    description:
      'Lead cloud platform design for recruitment analytics, secure multi-cloud deployments, and scalable infrastructure architecture across hiring systems.',
    requirements: ['Cloud strategy', 'solution architecture', 'security posture', 'multi-cloud design'],
    matchTags: ['Architecture', 'Cloud', 'Security', 'Scalability']
  },
  {
    id: 4,
    title: 'DevOps Engineer',
    company: 'PulseTech Solutions',
    location: 'Chandigarh, India',
    type: 'Contract',
    salary: '₹10 LPA',
    posted: '4 days ago',
    skills: ['CI/CD', 'GitHub Actions', 'Docker', 'Linux'],
    description:
      'Build deployment automation and release processes for a recruiting marketplace, ensuring reliable builds and faster delivery cycles.',
    requirements: ['Continuous integration', 'container deployment', 'automation scripting', 'cloud tooling'],
    matchTags: ['CI/CD', 'Automation', 'Containers', 'Delivery']
  },
  {
    id: 5,
    title: 'Cloud Security Engineer',
    company: 'SecureHire',
    location: 'Gurugram, India',
    type: 'Full Time',
    salary: '₹16 LPA',
    posted: '1 week ago',
    skills: ['IAM', 'Cloud Security', 'Compliance', 'AWS'],
    description:
      'Protect cloud recruitment systems by building identity controls, enforcing compliance, and hardening cloud resources across AWS and Azure environments.',
    requirements: ['Identity and access management', 'cloud compliance', 'security automation', 'risk assessment'],
    matchTags: ['Security', 'Compliance', 'Cloud', 'IAM']
  },
  {id: 1,
    title: 'uic mc expert',
    company: 'uic Recruit',
    location: 'chandigarh, India',
    type: 'Full Time',
    salary: '₹19 LPA',
    posted: '1 day ago',
    skills: ['AWS', 'Terraform', 'Docker', 'Kubernetes'],
    description:
      'Design and implement automated cloud infrastructure pipelines, manage container orchestration, and improve deployment reliability for distributed recruitment services.',
    requirements: ['AWS architecture', 'Infrastructure as Code', 'CI/CD automation', 'Kubernetes operations'],
    matchTags: ['Cloud', 'CI/CD', 'Infrastructure', 'Automation']
  }
];

function normalizeSkills(skillsText) {
  return skillsText
    .split(/[,;]+/) 
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.toLowerCase());
}

function calculateMatchScore(candidateSkillsText, jobSkills, jobDescription) {
  if (!candidateSkillsText) return 20;
  const candidateSkills = normalizeSkills(candidateSkillsText);
  const matchedSkills = jobSkills.filter((skill) => candidateSkills.includes(skill.toLowerCase()));
  const descriptionMatches = normalizeSkills(jobDescription).filter((word) => candidateSkills.includes(word));
  const baseScore = matchedSkills.length / jobSkills.length;
  const bonus = Math.min(descriptionMatches.length, 3) * 0.08;
  const score = Math.min(100, Math.round((baseScore + bonus) * 100));
  return Math.max(score, 20);
}

function buildAiResume(candidate, job) {
  const skills = normalizeSkills(candidate.skills).length
    ? normalizeSkills(candidate.skills).map((skill) => skill.charAt(0).toUpperCase() + skill.slice(1))
    : job.skills;
  const certifications = normalizeSkills(candidate.certifications).length
    ? normalizeSkills(candidate.certifications).map((cert) => cert
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      )
    : [];

  const objective = candidate.experience
    ? `Experienced IT professional with strong ${skills.join(', ')} skills, targeting the ${job.title} role at ${job.company}. Focused on cloud infrastructure, automation, and production-ready operations.`
    : `Motivated candidate seeking the ${job.title} position at ${job.company}, with strong ${skills.join(', ')} fundamentals and a commitment to infrastructure automation.`;

  return {
    name: candidate.name || 'Applicant Name',
    email: candidate.email || 'name@example.com',
    phone: candidate.phone || '+91 98765 43210',
    location: job.location,
    objective,
    skills,
    experience:
      candidate.experience ||
      `Implemented cloud automation, CI/CD pipelines, and secure infrastructure practices for enterprise IT environments aligned to ${job.title} needs.`,
    education: candidate.education || 'B.Tech in Computer Science or equivalent',
    certifications: certifications.length ? certifications : ['AWS Certified Solutions Architect', 'Certified Kubernetes Administrator'],
    jobTitle: job.title,
    company: job.company,
    jobLocation: job.location,
    requirements: job.requirements || []
  };
}

function getStatusBadge(status) {
  switch (status) {
    case 'Applied':
      return 'bg-info text-dark';
    case 'Interview':
      return 'bg-warning text-dark';
    case 'Offer':
      return 'bg-success';
    case 'Rejected':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
}

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedJobId, setSelectedJobId] = useState(jobPostings[0].id);
  const [candidate, setCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    skills: '',
    experience: '',
    education: '',
    certifications: ''
  });
  const [applications, setApplications] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [resumeMessage, setResumeMessage] = useState('');
  const resumeRef = useRef();

  const selectedJob = jobPostings.find((job) => job.id === selectedJobId) || jobPostings[0];

  const filteredJobs = useMemo(() => {
    return jobPostings.filter((job) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.skills.join(' ').toLowerCase().includes(searchLower);
      const matchesLocation = locationFilter === 'All' || job.location === locationFilter;
      const matchesType = typeFilter === 'All' || job.type === typeFilter;
      return matchesSearch && matchesLocation && matchesType;
    });
  }, [searchTerm, locationFilter, typeFilter]);

  const locations = ['All', ...new Set(jobPostings.map((job) => job.location))];
  const types = ['All', ...new Set(jobPostings.map((job) => job.type))];
  const matchScore = calculateMatchScore(candidate.skills, selectedJob.skills, selectedJob.description);
  const aiResume = buildAiResume(candidate, selectedJob);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCandidate((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = (event) => {
    event.preventDefault();
    if (!candidate.name || !candidate.email || !candidate.phone) {
      setStatusMessage('Please complete name, email, and phone before applying.');
      return;
    }

    const today = new Date().toLocaleDateString();
    const existing = applications.find((item) => item.jobId === selectedJob.id);
    const updatedApplications = existing
      ? applications.map((item) =>
          item.jobId === selectedJob.id
            ? { ...item, status: 'Applied', appliedOn: today }
            : item
        )
      : [
          ...applications,
          {
            jobId: selectedJob.id,
            title: selectedJob.title,
            company: selectedJob.company,
            status: 'Applied',
            appliedOn: today
          }
        ];

    setApplications(updatedApplications);
    setStatusMessage(`Application submitted for ${selectedJob.title} at ${selectedJob.company}.`);
  };

  const handleBuildResume = () => {
    setResumeMessage('AI resume generated from the selected job description.');
  };

  const downloadResume = async () => {
    if (!resumeRef.current) return;

    try {
      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('AI-Resume.pdf');
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  };

  return (
    <section className="dashboard-wrapper">
      <div className="row gx-4 gy-4">
        <div className="col-xl-3">
          <div className="card border-0 shadow-sm p-4 dashboard-nav">
            <h5 className="mb-3">Dashboard navigation</h5>
            <ul className="dashboard-nav-links">
              <li><a href="#job-openings">Job Openings</a></li>
              <li><a href="#selected-job">Selected Job</a></li>
              <li><a href="#application-status">Application Status</a></li>
              <li><a href="#resume-builder">AI Resume Builder</a></li>
              <li><a href="#candidate-profile">Candidate Profile</a></li>
            </ul>
          </div>
          <div className="glass-card p-4 mt-4" id="candidate-profile">
            <div className="d-flex align-items-center mb-4">
              <span className="icon-circle bg-primary text-white me-3">
                <FaMapMarkerAlt />
              </span>
              <div>
                <h5 className="mb-1">Candidate profile</h5>
                <p className="mb-0 text-muted">Keep your profile updated to get accurate matches.</p>
              </div>
            </div>
            <form className="job-form">
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={candidate.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={candidate.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={candidate.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Key Skills</label>
                <input
                  type="text"
                  name="skills"
                  className="form-control"
                  value={candidate.skills}
                  onChange={handleChange}
                  placeholder="AWS, Kubernetes, Terraform"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Experience Summary</label>
                <textarea
                  name="experience"
                  className="form-control"
                  rows="3"
                  value={candidate.experience}
                  onChange={handleChange}
                  placeholder="Describe your cloud and DevOps experience in 2-3 sentences"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Education</label>
                <input
                  type="text"
                  name="education"
                  className="form-control"
                  value={candidate.education}
                  onChange={handleChange}
                  placeholder="B.Tech in CSE, MCA, etc."
                />
              </div>
              <div className="mb-4">
                <label className="form-label">Certifications</label>
                <input
                  type="text"
                  name="certifications"
                  className="form-control"
                  value={candidate.certifications}
                  onChange={handleChange}
                  placeholder="AWS Certified Solutions Architect, Azure DevOps Engineer"
                />
              </div>
            </form>
          </div>
        </div>

        <div className="col-xl-5">
          <div className="card border-0 shadow-sm p-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-4 gap-3">
              <div>
                <p className="text-uppercase text-secondary mb-1 tracking">Job Openings</p>
                <h2 className="h4 mb-0">Browse cloud and DevOps roles</h2>
              </div>
              <div className="search-group d-flex gap-2 flex-wrap">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-secondary">
                    <FaSearch />
                  </span>
                  <input
                    type="search"
                    className="form-control border-start-0"
                    placeholder="Search jobs, skills, company"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
                <select className="form-select" value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                <select className="form-select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="row gy-3" id="job-openings">
              {filteredJobs.map((job) => (
                <div key={job.id} className="col-md-6">
                  <button
                    type="button"
                    className={`job-card btn btn-outline-light w-100 text-start d-flex flex-column h-100 ${selectedJobId === job.id ? 'selected-job' : ''}`}
                    onClick={() => setSelectedJobId(job.id)}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="mb-1">{job.title}</h5>
                        <p className="mb-1 text-muted small">{job.company}</p>
                      </div>
                      <span className="badge bg-primary align-self-start">{job.type}</span>
                    </div>
                    <p className="mb-2 text-muted small">{job.description}</p>
                    <div className="d-flex flex-wrap gap-2 mt-auto">
                      <span className="job-tag">{job.location}</span>
                      <span className="job-tag">{job.salary}</span>
                      <span className="job-tag">{job.posted}</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card border-0 shadow-sm p-4" id="selected-job">
            <div className="d-flex align-items-center mb-3">
              <span className="icon-circle bg-secondary text-white me-3">
                <FaBriefcase />
              </span>
              <div>
                <h5 className="mb-1">Selected Job</h5>
                <p className="mb-0 text-muted">Review the job description and requirements before applying.</p>
              </div>
            </div>
            <div>
              <h4 className="mb-2">{selectedJob.title}</h4>
              <p className="mb-2 text-muted">{selectedJob.company} • {selectedJob.location}</p>
              <p className="mb-3">{selectedJob.description}</p>
              <div className="mb-3">
                <strong>Required skills</strong>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {selectedJob.skills.map((skill) => (
                    <span key={skill} className="job-tag">{skill}</span>
                  ))}
                </div>
              </div>
              <div>
                <strong>Role highlights</strong>
                <ul className="mb-0 text-muted">
                  {selectedJob.matchTags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-secondary">Match score</span>
                  <strong>{matchScore}%</strong>
                </div>
                <div className="progress" style={{ height: '14px' }}>
                  <div className="progress-bar bg-success" role="progressbar" style={{ width: `${matchScore}%` }} />
                </div>
              </div>
              <div className="d-grid gap-2 mb-3">
                <button type="button" className="btn btn-outline-primary" onClick={() => setStatusMessage(`Match score updated to ${matchScore}% based on your profile.`)}>
                  Check Match
                </button>
                <button type="button" className="btn btn-primary" onClick={handleApply}>
                  Apply to {selectedJob.title}
                </button>
              </div>
              {statusMessage && <div className="alert alert-info mb-0">{statusMessage}</div>}
            </div>
          </div>
        </div>

        <div className="col-xl-12">
          <div className="card border-0 shadow-sm p-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <p className="text-uppercase text-secondary mb-1 tracking">Application management</p>
                <h2 className="h5 mb-0">Track your application status</h2>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Applied On</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.length > 0 ? (
                    applications.map((item) => (
                      <tr key={item.jobId}>
                        <td>{item.title}</td>
                        <td>{item.company}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(item.status)}`}>{item.status}</span>
                        </td>
                        <td>{item.appliedOn}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">
                        No applications yet. Apply for a job to start tracking status.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-xl-12">
          <div className="card border-0 shadow-sm p-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <p className="text-uppercase text-secondary mb-1 tracking">AI Resume Builder</p>
                <h2 className="h5 mb-0">Generate a resume tailored to this job</h2>
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-outline-primary" onClick={handleBuildResume}>
                  Build AI Resume
                </button>
                <button type="button" className="btn btn-success" onClick={downloadResume}>
                  <FaDownload /> Download AI Resume
                </button>
              </div>
            </div>
            {resumeMessage && <div className="alert alert-success mb-4">{resumeMessage}</div>}
            <div ref={resumeRef}>
              <JobSummary job={selectedJob} applicant={aiResume} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
