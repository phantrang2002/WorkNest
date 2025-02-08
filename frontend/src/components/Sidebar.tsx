import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from '../app/assets/css/sidebar.module.css';
import router from 'next/router';

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRecruitmentOpen, setIsRecruitmentOpen] = useState(false);
  const [isCVTemplatesOpen, setIsCVTemplatesOpen] = useState(false);
  const [isEmployerManagementOpen, setIsEmployerManagementOpen] = useState(false);
  const [isCandidateManagementOpen, setIsCandidateManagementOpen] = useState(false);
  const [isPolicyManagementOpen, setIsPolicyManagementOpen] = useState(false); 
  const [isFeedbackManagementOpen, setIsFeedbackManagementOpen] = useState(false);  
  const [isStatisticManagementOpen, setIsStatisticManagementOpen] = useState(false);  
  const [token, setToken] = useState<string | null>(null);
    


    useEffect(() => {
        const storedToken = localStorage.getItem('userToken');
        setToken(storedToken);
    }, []);

    useEffect(() => {
        const storedRole = localStorage.getItem('userRole');
        if (storedRole !== 'Admin') {
            alert('You do not have permission to access this page.');
            router.push('/home');
        }
    }, [router]);

  

  const toggleRecruitmentMenu = () => {
    setIsRecruitmentOpen(prevState => !prevState);
  };

  const toggleCVTemplatesMenu = () => {
    setIsCVTemplatesOpen(prevState => !prevState);
  };

  const toggleEmployerManagementMenu = () => {
    setIsEmployerManagementOpen(prevState => !prevState);
  };

  const toggleCandidateManagementMenu = () => {
    setIsCandidateManagementOpen(prevState => !prevState);
  };

  const togglePolicyManagementMenu = () => {
    setIsPolicyManagementOpen(prevState => !prevState);  
  };

  const toggleFeedbackManagementMenu = () => {
    setIsFeedbackManagementOpen(prevState => !prevState);  
  };

  const toggleStatisticManagementMenu = () => {
    setIsStatisticManagementOpen(prevState => !prevState); 
  };  

  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    router.push('/login');
  };

  return (
    <div className={styles.sidebar}>
      <h2>Admin Dashboard</h2>
      <ul className={styles.menu}> 
        <li>
          <div onClick={toggleStatisticManagementMenu} className={`${styles.menuItem} ${isStatisticManagementOpen ? styles.active : ''}`}>
            <span>Statistics Report</span>
          </div>
          <ul className={`${styles.subMenu} ${isStatisticManagementOpen ? styles.open : ''}`}>
            <li>
              <Link href="/admin/report/overview">System Overview</Link>
            </li>
            <li>
              <Link href="/admin/report/recruitment">Recruitment Report</Link>
            </li>
          </ul>
        </li>
        <li>
          <div onClick={toggleRecruitmentMenu} className={`${styles.menuItem} ${isRecruitmentOpen ? styles.active : ''}`}>
            <span>Recruitment Management</span>
          </div>
          <ul className={`${styles.subMenu} ${isRecruitmentOpen ? styles.open : ''}`}>
            <li>
              <Link href="/admin/recruitment-management/all-jobs">All Jobs</Link>
            </li>
            <li>
              <Link href="/admin/recruitment-management/pending-jobs">Pending Jobs</Link>
            </li>
            <li>
              <Link href="/admin/recruitment-management/expired-jobs">Expired Jobs</Link>
            </li>
            <li>
              <Link href="/admin/recruitment-management/available-jobs">Available Jobs</Link>
            </li>
            <li>
              <Link href="/admin/recruitment-management/locked-jobs">Locked Jobs</Link>
            </li>
            <li>
              <Link href="/admin/recruitment-management/closed-jobs">Closed Jobs</Link>
            </li>
          </ul>
        </li>
        <li>
          <div onClick={toggleCVTemplatesMenu} className={`${styles.menuItem} ${isCVTemplatesOpen ? styles.active : ''}`}>
            <span>CV Templates</span>
          </div>
          <ul className={`${styles.subMenu} ${isCVTemplatesOpen ? styles.open : ''}`}>
            <li>
              <Link href="/admin/cv-templates/all">All CV Templates</Link>
            </li>
            <li>
              <Link href="/admin/cv-templates/upload">Upload CV Template</Link>
            </li>
          </ul>
        </li>
        <li>
          <div onClick={toggleEmployerManagementMenu} className={`${styles.menuItem} ${isEmployerManagementOpen ? styles.active : ''}`}>
            <span>Employer Management</span>
          </div>
          <ul className={`${styles.subMenu} ${isEmployerManagementOpen ? styles.open : ''}`}>
            <li>
              <Link href="/admin/employer-management/available-employers">Available Employers</Link>
            </li>
            <li>
              <Link href="/admin/employer-management/locked-employers">Locked Employers</Link>
            </li>
          </ul>
        </li>
        <li>
          <div onClick={toggleCandidateManagementMenu} className={`${styles.menuItem} ${isCandidateManagementOpen ? styles.active : ''}`}>
            <span>Candidate Management</span>
          </div>
          <ul className={`${styles.subMenu} ${isCandidateManagementOpen ? styles.open : ''}`}>
            <li>
              <Link href="/admin/candidate-management/available-candidates">Available Candidates</Link>
            </li>
            <li>
              <Link href="/admin/candidate-management/locked-candidates">Locked Candidates</Link>
            </li>
          </ul>
        </li>
        
        {/* Policy Management */}
        <li>
          <div onClick={togglePolicyManagementMenu} className={`${styles.menuItem} ${isPolicyManagementOpen ? styles.active : ''}`}>
            <span>Policy Management</span>
          </div>
          <ul className={`${styles.subMenu} ${isPolicyManagementOpen ? styles.open : ''}`}>
            <li>
              <Link href="/admin/policy-management/all">All Policies</Link>
            </li>
            <li>
              <Link href="/admin/policy-management/add">Add Policy</Link>
            </li>
          </ul>
        </li>

        {/* Feedback Management */}
        <li>
          <div onClick={toggleFeedbackManagementMenu} className={`${styles.menuItem} ${isFeedbackManagementOpen ? styles.active : ''}`}>
            <span>Feedback Management</span>
          </div>
          <ul className={`${styles.subMenu} ${isFeedbackManagementOpen ? styles.open : ''}`}>
            <li>
              <Link href="/admin/feedback-management/resolved">Resolved Feedback</Link>
            </li>
            <li>
              <Link href="/admin/feedback-management/unresolved">Unresolved Feedback</Link>
            </li>
          </ul>
        </li>

        <li>
          <button onClick={handleLogout} className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition">Log out</button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
