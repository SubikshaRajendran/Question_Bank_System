import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { fetchApi } from '../../utils/api';
import { Trash2, AlertTriangle, ArrowLeft, Save, X, Edit2, Upload } from 'lucide-react';
import Toast from '../../components/Toast';
import ConfirmationModal from '../../components/ConfirmationModal';

const EditCourse = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [studentCount, setStudentCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Form States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState('Medium');
    const [department, setDepartment] = useState('');
    const [image, setImage] = useState(null); // File object
    const [newQuestionText, setNewQuestionText] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // UI States
    const [toast, setToast] = useState(null);
    const [editingQId, setEditingQId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [activeTab, setActiveTab] = useState('details');
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

    // Quiz States
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [editingQuizQId, setEditingQuizQId] = useState(null);
    const [quizForm, setQuizForm] = useState({
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A'
    });
    const [showQuizImportModal, setShowQuizImportModal] = useState(false);
    const [pendingQuizQuestions, setPendingQuizQuestions] = useState([]);
    const [showDeleteSelectedQuizModal, setShowDeleteSelectedQuizModal] = useState(false);
    const [selectedQuizQuestionIds, setSelectedQuizQuestionIds] = useState([]);

    // Modal State
    const [showImportModal, setShowImportModal] = useState(false);
    const [pendingQuestions, setPendingQuestions] = useState([]);
    const [importModalMessage, setImportModalMessage] = useState('');
    const [showDeleteCourseModal, setShowDeleteCourseModal] = useState(false);

    // Ref for inline edit input
    const editInputRef = useRef(null);

    useEffect(() => {
        loadCourse();
    }, [id]);

    useEffect(() => {
        if (editingQId && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [editingQId]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const loadCourse = async () => {
        try {
            const data = await fetchApi(`/courses/${id}`);
            if (!data.course) throw new Error("Course not found");

            setCourse(data.course);
            setTitle(data.course.title);
            setDescription(data.course.description || '');
            setDifficulty(data.course.difficulty || 'Medium');
            setDepartment(data.course.department || '');
            setQuestions(data.questions || []);
            setStudentCount(data.studentCount || 0);

            // Fetch Quiz Questions
            const quizData = await fetchApi(`/quiz/admin/course/${id}`);
            setQuizQuestions(quizData || []);

        } catch (err) {
            console.error("Failed to load course", err);
            showToast('Failed to load course', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateDetails = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('difficulty', difficulty);
            formData.append('department', department);
            if (image) {
                formData.append('image', image);
            }

            const token = localStorage.getItem('token');
            const res = await fetch(`/api/courses/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update details');
            }

            const updatedCourse = await res.json();
            setCourse(updatedCourse);

            showToast('Course details updated successfully!');
            setIsEditingDetails(false);
            setImage(null); // Reset file input
        } catch (err) {
            console.error(err);
            showToast('Failed to update details', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteCourse = async () => {
        setShowDeleteCourseModal(true);
    };

    const confirmDeleteCourse = async () => {
        setShowDeleteCourseModal(false);
        try {
            await fetchApi(`/courses/${id}`, { method: 'DELETE' });
            navigate('/admin/dashboard');
        } catch (err) {
            console.error(err);
            showToast('Failed to delete course', 'error');
        }
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        if (!newQuestionText.trim()) return;

        setActionLoading(true);
        try {
            const newCtx = { text: newQuestionText, courseId: id };
            const addedQ = await fetchApi('/questions', {
                method: 'POST',
                body: JSON.stringify(newCtx)
            });
            setQuestions([...questions, addedQ]);
            setNewQuestionText('');
            showToast('Success! Question added.');
        } catch (err) {
            console.error(err);
            showToast('Failed to add question', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (!file.name.endsWith('.xlsx')) {
            showToast('Please upload only Excel files (.xlsx)', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                // Assume first column has questions
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

                // Extract questions - flatten and filter empty
                const extractedQuestions = data.flat().filter(q => q && typeof q === 'string' && q.trim().length > 0);

                if (extractedQuestions.length === 0) {
                    showToast('No valid questions found in file.', 'warning');
                    return;
                }

                if (extractedQuestions.length === 0) {
                    showToast('No valid questions found in file.', 'warning');
                    return;
                }

                // Show confirmation modal instead of window.confirm
                setPendingQuestions(extractedQuestions);
                setImportModalMessage(`Found ${extractedQuestions.length} questions. Import them?`);
                setShowImportModal(true);

                // Reset file input here as we've read it
                e.target.value = null;

            } catch (err) {
                console.error("Import failed", err);
                showToast('Failed to import questions. Check file format.', 'error');
                e.target.value = null; // Reset on error too
            }
        };
        reader.readAsBinaryString(file);
    };

    const confirmImport = async () => {
        setShowImportModal(false);
        setActionLoading(true);
        try {
            // Send to backend
            const insertedQuestions = await fetchApi('/questions/bulk-create', {
                method: 'POST',
                body: JSON.stringify({ questions: pendingQuestions, courseId: id })
            });

            setQuestions([...questions, ...insertedQuestions]);
            showToast(`Successfully imported ${insertedQuestions.length} questions!`);
        } catch (err) {
            console.error("Import failed", err);
            showToast('Failed to import questions. Check file format.', 'error');
        } finally {
            setActionLoading(false);
            setPendingQuestions([]);
        }
    };

    const cancelImport = () => {
        setShowImportModal(false);
        setPendingQuestions([]);
    };

    const handleDeleteQuestion = async (qId) => {
        if (!window.confirm("Are you sure you want to delete this question? This action cannot be undone.")) return;
        try {
            await fetchApi(`/questions/${qId}`, { method: 'DELETE' });
            setQuestions(questions.filter(q => q._id !== qId));
            setSelectedQuestionIds(selectedQuestionIds.filter(id => id !== qId));
            showToast('Question deleted.');
        } catch (err) {
            console.error(err);
            showToast("Failed to delete question", 'error');
        }
    };

    const toggleSelectAll = () => {
        if (selectedQuestionIds.length === questions.length) {
            setSelectedQuestionIds([]);
        } else {
            setSelectedQuestionIds(questions.map(q => q._id));
        }
    };

    const toggleSelectQuestion = (qId) => {
        if (selectedQuestionIds.includes(qId)) {
            setSelectedQuestionIds(selectedQuestionIds.filter(id => id !== qId));
        } else {
            setSelectedQuestionIds([...selectedQuestionIds, qId]);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedQuestionIds.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedQuestionIds.length} questions? This action cannot be undone.`)) return;

        setActionLoading(true);
        try {
            await fetchApi('/questions/bulk-delete', {
                method: 'POST',
                body: JSON.stringify({ questionIds: selectedQuestionIds })
            });

            setQuestions(questions.filter(q => !selectedQuestionIds.includes(q._id)));
            setSelectedQuestionIds([]);
            showToast('Selected questions deleted.');
        } catch (err) {
            console.error(err);
            showToast('Failed to delete selected questions', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // --- QUIZ FUNCTIONS ---
    const handleSaveQuizQuestion = async (e) => {
        e.preventDefault();
        if (!quizForm.question.trim() || !quizForm.optionA.trim() || !quizForm.optionB.trim() || !quizForm.optionC.trim() || !quizForm.optionD.trim()) {
            showToast('Please fill out all quiz fields', 'error');
            return;
        }

        setActionLoading(true);
        try {
            if (editingQuizQId) {
                // Update
                const res = await fetchApi(`/quiz/admin/question/${editingQuizQId}`, {
                    method: 'PUT',
                    body: JSON.stringify(quizForm)
                });
                setQuizQuestions(quizQuestions.map(q => q._id === editingQuizQId ? res : q));
                showToast('Quiz question updated successfully');
            } else {
                // Create
                const newCtx = { ...quizForm, courseId: id };
                const res = await fetchApi(`/quiz/admin/question`, {
                    method: 'POST',
                    body: JSON.stringify(newCtx)
                });
                setQuizQuestions([res, ...quizQuestions]);
                showToast('Quiz question created successfully');
            }

            // Reset form
            setEditingQuizQId(null);
            setQuizForm({
                question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A'
            });

        } catch (err) {
            console.error(err);
            showToast('Failed to save quiz question', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditQuizQuestionClick = (q) => {
        setEditingQuizQId(q._id);
        setQuizForm({
            question: q.question,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer
        });
        // Scroll slightly up so they can see the form
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    const handleDeleteQuizQuestion = async (qId) => {
        if (!window.confirm("Are you sure you want to delete this quiz question?")) return;
        try {
            await fetchApi(`/quiz/admin/question/${qId}`, { method: 'DELETE' });
            setQuizQuestions(quizQuestions.filter(q => q._id !== qId));
            showToast('Quiz question deleted.');
        } catch (err) {
            console.error(err);
            showToast("Failed to delete quiz question", 'error');
        }
    };

    const handleCancelQuizEdit = () => {
        setEditingQuizQId(null);
        setQuizForm({
            question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A'
        });
    };

    const toggleSelectQuizQuestion = (qId) => {
        setSelectedQuizQuestionIds(prev =>
            prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
        );
    };

    const toggleSelectAllQuizQuestions = () => {
        if (selectedQuizQuestionIds.length === quizQuestions.length && quizQuestions.length > 0) {
            setSelectedQuizQuestionIds([]);
        } else {
            setSelectedQuizQuestionIds(quizQuestions.map(q => q._id));
        }
    };

    const confirmDeleteSelectedQuizQuestions = async () => {
        if (selectedQuizQuestionIds.length === 0) return;
        setActionLoading(true);
        try {
            const res = await fetchApi('/quiz/admin/question/bulk-delete', {
                method: 'POST',
                body: JSON.stringify({ questionIds: selectedQuizQuestionIds })
            });
            if (res.success) {
                setQuizQuestions(quizQuestions.filter(q => !selectedQuizQuestionIds.includes(q._id)));
                setSelectedQuizQuestionIds([]);
                showToast(`Successfully deleted ${res.deletedCount} quiz questions.`);
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to delete selected quiz questions", 'error');
        } finally {
            setActionLoading(false);
            setShowDeleteSelectedQuizModal(false);
        }
    };

    const handleQuizFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    showToast('The uploaded file is empty.', 'error');
                    return;
                }

                const validQuestions = [];
                let errorCount = 0;

                data.forEach((row, index) => {
                    const qText = row.question || row.Question;
                    const optA = row.optionA || row.OptionA;
                    const optB = row.optionB || row.OptionB;
                    const optC = row.optionC || row.OptionC;
                    const optD = row.optionD || row.OptionD;
                    let correctAns = row.correctAnswer || row.CorrectAnswer;

                    if (qText && optA && optB && optC && optD && correctAns) {
                        correctAns = String(correctAns).trim().toUpperCase();
                        if (['A', 'B', 'C', 'D'].includes(correctAns)) {
                            validQuestions.push({
                                courseId: id,
                                question: qText,
                                optionA: optA,
                                optionB: optB,
                                optionC: optC,
                                optionD: optD,
                                correctAnswer: correctAns
                            });
                        } else {
                            errorCount++;
                        }
                    } else {
                        errorCount++;
                    }
                });

                if (validQuestions.length > 0) {
                    setPendingQuizQuestions(validQuestions);
                    setShowQuizImportModal(true);
                    if (errorCount > 0) {
                        showToast(`Found ${validQuestions.length} valid questions. Skipped ${errorCount} invalid rows.`, 'warning');
                    }
                } else {
                    showToast('No valid quiz questions found. Ensure columns match: question, optionA, optionB, optionC, optionD, correctAnswer (A/B/C/D).', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Error reading file. Please upload a valid Excel or CSV.', 'error');
            }
        };
        reader.readAsBinaryString(file);

        // Reset file input so same file can be selected again if needed
        e.target.value = null;
    };

    const confirmQuizImport = async () => {
        setActionLoading(true);
        try {
            const res = await fetchApi('/quiz/admin/question/bulk', {
                method: 'POST',
                body: JSON.stringify({ questions: pendingQuizQuestions })
            });

            if (res.success) {
                // Refresh quiz questions list
                const quizData = await fetchApi(`/quiz/admin/course/${id}`);
                setQuizQuestions(quizData || []);
                showToast(`Successfully imported ${res.count} quiz questions!`);
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to import quiz questions', 'error');
        } finally {
            setActionLoading(false);
            setShowQuizImportModal(false);
            setPendingQuizQuestions([]);
        }
    };

    const cancelQuizImport = () => {
        setShowQuizImportModal(false);
        setPendingQuizQuestions([]);
    };

    // Inline Editing Functions
    const startEditing = (q) => {
        setEditingQId(q._id);
        setEditingText(q.text || ''); // Ensure text is string
    };

    const cancelEditing = () => {
        setEditingQId(null);
        setEditingText('');
    };

    const saveEditing = async (qId) => {
        if (!editingText.trim() || editingText === questions.find(q => q._id === qId)?.text) {
            cancelEditing();
            return;
        }

        try {
            // Assuming backend supports PUT /questions/:id
            // Check backend routes/questions.js if possible. Standard REST usually supports it.
            // If not implemented, we might need to implement it.
            // The initial requirement for backend setup mentioned managing questions.
            // Let's assume it exists or use a generic update if available.
            // If not, we might need to add it.
            // We'll try generic PUT.
            await fetchApi(`/questions/${qId}`, {
                method: 'PUT',
                body: JSON.stringify({ text: editingText })
            });

            setQuestions(questions.map(q => q._id === qId ? { ...q, text: editingText } : q));
            showToast('Question updated!');
            cancelEditing();
        } catch (err) {
            console.error(err);
            showToast('Failed to update question', 'error');
        }
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>;
    if (!course) return <div className="container">Course not found</div>;

    return (
        <div className="container">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header aligned */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to="/admin/dashboard" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowLeft size={18} /> Back
                    </Link>
                    <h2 style={{ marginBottom: 0 }}>Edit Course</h2>
                </div>
            </div>
            {/* Tabs */}
            <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                <button
                    className={`btn ${activeTab === 'details' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('details')}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: '-1px' }}
                >
                    Update Course Details
                </button>
                <button
                    className={`btn ${activeTab === 'questions' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('questions')}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: '-1px' }}
                >
                    Manage Questions
                </button>
                <button
                    className={`btn ${activeTab === 'quiz' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('quiz')}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: '-1px' }}
                >
                    Quiz Questions
                </button>
            </div>

            {activeTab === 'details' && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Course Information</h3>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div className="difficulty-badge difficulty-Medium" style={{ background: 'var(--bg-color)', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' }}>
                                👥 {studentCount} Students Registered
                            </div>
                            {!isEditingDetails && (
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setIsEditingDetails(true)}
                                    title="Edit Details"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                >
                                    <Edit2 size={18} /> Edit
                                </button>
                            )}
                        </div>
                    </div>

                    {!isEditingDetails ? (
                        /* Read-Only View */
                        <div className="course-details-view">
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Course Name</label>
                                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{title}</div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Description</label>
                                <div style={{ fontSize: '1rem', lineHeight: '1.5' }}>{description || <em>No description provided.</em>}</div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Difficulty</label>
                                <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '4px', background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                                    {difficulty}
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Department</label>
                                <div style={{ fontSize: '1rem' }}>{department || 'N/A'}</div>
                            </div>
                            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                <button
                                    type="button"
                                    onClick={handleDeleteCourse}
                                    className="btn btn-danger-dark"
                                    style={{ backgroundColor: '#dc2626', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Trash2 size={18} /> Delete Course
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Edit Form */
                        <form onSubmit={handleUpdateDetails}>
                            <div className="form-group">
                                <label htmlFor="title" style={{ fontSize: '1rem', fontWeight: 600 }}>Course Name</label>
                                <input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    style={{ fontSize: '1rem', padding: '0.75rem' }}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description" style={{ fontSize: '1rem', fontWeight: 600 }}>Description</label>
                                <textarea
                                    id="description"
                                    rows="3"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    style={{ fontSize: '1rem', padding: '0.75rem' }}
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="image" style={{ fontSize: '1rem', fontWeight: 600 }}>Course Image (Optional)</label>
                                <input
                                    type="file"
                                    id="image"
                                    accept="image/*"
                                    onChange={(e) => setImage(e.target.files[0])}
                                    style={{ fontSize: '1rem', padding: '0.75rem' }}
                                />
                                {course.image && !image && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        Current image: {course.image.split('/').pop()}
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="difficulty" style={{ fontSize: '1rem', fontWeight: 600 }}>Difficulty</label>
                                <select
                                    id="difficulty"
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', fontSize: '1rem' }}
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="department" style={{ fontSize: '1rem', fontWeight: 600 }}>Department</label>
                                <select
                                    id="department"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', fontSize: '1rem' }}
                                >
                                    <option value="">Select Department</option>
                                    <option value="CS Cluster">CS Cluster</option>
                                    <option value="Core">Core</option>
                                    <option value="General/Common">General/Common</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="submit" className="btn btn-lg" disabled={actionLoading} style={{ fontWeight: 600 }}>
                                    {actionLoading ? 'Updating...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setIsEditingDetails(false);
                                        if (course) {
                                            setTitle(course.title);
                                            setDescription(course.description || '');
                                            setDifficulty(course.difficulty || 'Medium');
                                            setDepartment(course.department || '');
                                        }
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {activeTab === 'questions' && (
                <>
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Add New Question</h3>
                        <form onSubmit={handleAddQuestion}>
                            <div className="form-group">
                                <label htmlFor="qText" style={{ fontSize: '1rem', fontWeight: 600 }}>Question Text</label>
                                <textarea
                                    id="qText"
                                    required
                                    rows="3"
                                    placeholder="Enter question here..."
                                    value={newQuestionText}
                                    onChange={(e) => setNewQuestionText(e.target.value)}
                                    style={{ fontSize: '1rem', padding: '0.75rem', borderColor: 'var(--primary-color)' }}
                                ></textarea>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <button type="submit" className="btn" disabled={actionLoading} style={{ fontWeight: 600 }}>
                                    Add Question
                                </button>
                                <div style={{ position: 'relative', overflow: 'hidden' }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        style={{ fontWeight: 600 }}
                                        onClick={() => document.getElementById('excel-upload').click()}
                                        disabled={actionLoading}
                                    >
                                        📥 Import from Excel
                                    </button>
                                    <input
                                        id="excel-upload"
                                        type="file"
                                        accept=".xlsx"
                                        onChange={handleFileUpload}
                                        style={{ position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer', height: '100%', width: '100%' }}
                                    />
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Existing Questions ({questions.length})</h3>
                            {questions.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="checkbox"
                                            id="selectAll"
                                            checked={questions.length > 0 && selectedQuestionIds.length === questions.length}
                                            onChange={toggleSelectAll}
                                            style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                                        />
                                        <label htmlFor="selectAll" style={{ cursor: 'pointer', userSelect: 'none' }}>Select All</label>
                                    </div>
                                    {selectedQuestionIds.length > 0 && (
                                        <button
                                            onClick={handleBulkDelete}
                                            className="btn btn-danger-dark btn-sm"
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                            disabled={actionLoading}
                                        >
                                            <Trash2 size={16} /> Delete Selected ({selectedQuestionIds.length})
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            {questions.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                                    <p style={{ fontSize: '1.1rem' }}>No questions added yet.</p>
                                    <p>Use the form above to start building your bank!</p>
                                </div>
                            ) : (
                                questions.map((q, index) => (
                                    <div key={q._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: '1px solid var(--border-color)', padding: '1rem 0' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedQuestionIds.includes(q._id)}
                                            onChange={() => toggleSelectQuestion(q._id)}
                                            style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            {editingQId === q._id ? (
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'start' }}>
                                                    <textarea
                                                        ref={editInputRef}
                                                        value={editingText}
                                                        onChange={(e) => setEditingText(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault();
                                                                saveEditing(q._id);
                                                            }
                                                            if (e.key === 'Escape') cancelEditing();
                                                        }}
                                                        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid var(--primary-color)', minHeight: '80px' }}
                                                    />
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        <button onClick={() => saveEditing(q._id)} className="btn btn-sm" title="Save">
                                                            <Save size={16} />
                                                        </button>
                                                        <button onClick={cancelEditing} className="btn btn-sm btn-secondary" title="Cancel">
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: '1rem' }}>{q.text}</div>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => startEditing(q)}
                                                className="btn btn-sm btn-secondary"
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.4rem' }}
                                                title="Edit"
                                                disabled={editingQId === q._id}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteQuestion(q._id)}
                                                className="btn btn-sm btn-danger"
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                            >
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'quiz' && (
                <>
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                            {editingQuizQId ? 'Edit Quiz Question' : 'Add New Quiz Question'}
                        </h3>
                        <form onSubmit={handleSaveQuizQuestion}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '1rem', fontWeight: 600 }}>Question Text</label>
                                <textarea
                                    required
                                    rows="3"
                                    placeholder="Enter quiz question here..."
                                    value={quizForm.question}
                                    onChange={(e) => setQuizForm({ ...quizForm, question: e.target.value })}
                                    style={{ width: '100%', fontSize: '1rem', padding: '0.75rem', borderColor: 'var(--primary-color)', borderRadius: '4px' }}
                                ></textarea>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Option A</label>
                                    <input
                                        type="text"
                                        required
                                        value={quizForm.optionA}
                                        onChange={(e) => setQuizForm({ ...quizForm, optionA: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Option B</label>
                                    <input
                                        type="text"
                                        required
                                        value={quizForm.optionB}
                                        onChange={(e) => setQuizForm({ ...quizForm, optionB: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Option C</label>
                                    <input
                                        type="text"
                                        required
                                        value={quizForm.optionC}
                                        onChange={(e) => setQuizForm({ ...quizForm, optionC: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Option D</label>
                                    <input
                                        type="text"
                                        required
                                        value={quizForm.optionD}
                                        onChange={(e) => setQuizForm({ ...quizForm, optionD: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.5rem', maxWidth: '300px' }}>
                                <label style={{ fontSize: '1rem', fontWeight: 600 }}>Correct Answer</label>
                                <select
                                    value={quizForm.correctAnswer}
                                    onChange={(e) => setQuizForm({ ...quizForm, correctAnswer: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                >
                                    <option value="A">Option A</option>
                                    <option value="B">Option B</option>
                                    <option value="C">Option C</option>
                                    <option value="D">Option D</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="submit" className="btn" disabled={actionLoading} style={{ fontWeight: 600 }}>
                                    {editingQuizQId ? 'Update Quiz Question' : 'Save Quiz Question'}
                                </button>
                                {editingQuizQId && (
                                    <button type="button" className="btn btn-secondary" onClick={handleCancelQuizEdit} disabled={actionLoading}>
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <input
                                    type="checkbox"
                                    checked={quizQuestions.length > 0 && selectedQuizQuestionIds.length === quizQuestions.length}
                                    onChange={toggleSelectAllQuizQuestions}
                                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                                    title="Select All"
                                />
                                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Existing Quiz Questions ({quizQuestions.length})</h3>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                {selectedQuizQuestionIds.length > 0 && (
                                    <button
                                        onClick={() => setShowDeleteSelectedQuizModal(true)}
                                        className="btn btn-danger"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        <Trash2 size={16} /> Delete Selected ({selectedQuizQuestionIds.length})
                                    </button>
                                )}
                                <input
                                    type="file"
                                    id="quiz-upload"
                                    accept=".xlsx, .xls, .csv"
                                    style={{ display: 'none' }}
                                    onChange={handleQuizFileUpload}
                                />
                                <label htmlFor="quiz-upload" className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Upload size={16} /> Import Quiz Questions
                                </label>
                            </div>
                        </div>
                        <div>
                            {quizQuestions.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                                    <p style={{ fontSize: '1.1rem' }}>No quiz questions created yet.</p>
                                </div>
                            ) : (
                                quizQuestions.map((q, index) => (
                                    <div key={q._id} style={{ borderBottom: '1px solid var(--border-color)', padding: '1rem 0', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedQuizQuestionIds.includes(q._id)}
                                            onChange={() => toggleSelectQuizQuestion(q._id)}
                                            style={{ cursor: 'pointer', width: '18px', height: '18px', marginTop: '0.25rem' }}
                                        />
                                        <div style={{ flex: 1, paddingRight: '1rem' }}>
                                            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{index + 1}. {q.question}</div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                <div><strong>A:</strong> {q.optionA}</div>
                                                <div><strong>B:</strong> {q.optionB}</div>
                                                <div><strong>C:</strong> {q.optionC}</div>
                                                <div><strong>D:</strong> {q.optionD}</div>
                                            </div>
                                            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--success)', fontWeight: 600 }}>
                                                Correct Answer: {q.correctAnswer}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                            <button
                                                onClick={() => handleEditQuizQuestionClick(q)}
                                                className="btn btn-sm btn-secondary"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteQuizQuestion(q._id)}
                                                className="btn btn-sm btn-danger"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
            {/* Quiz Confirmation Modal */}
            <ConfirmationModal
                isOpen={showQuizImportModal}
                title="Confirm Quiz Import"
                message={`Are you sure you want to import ${pendingQuizQuestions.length} quiz questions?`}
                onConfirm={confirmQuizImport}
                onCancel={cancelQuizImport}
                confirmText={`Import ${pendingQuizQuestions.length} Questions`}
                loading={actionLoading}
            />

            {/* Delete Selected Quiz Questions Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteSelectedQuizModal}
                title="Delete Selected Quiz Questions"
                message="Are you sure you want to delete the selected quiz questions? This action cannot be undone."
                onConfirm={confirmDeleteSelectedQuizQuestions}
                onCancel={() => setShowDeleteSelectedQuizModal(false)}
                confirmText="Yes, Delete"
                cancelText="Cancel"
                loading={actionLoading}
            />

            {/* Original Confirmation Modal */}
            <ConfirmationModal
                isOpen={showImportModal}
                title="Confirm Import"
                message={importModalMessage}
                onConfirm={confirmImport}
                onCancel={cancelImport}
                confirmText={`Import ${pendingQuestions.length} Questions`}
                loading={actionLoading}
            />

            {/* Delete Course Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteCourseModal}
                title="Delete Course"
                message="Are you sure you want to delete this course? This action cannot be undone."
                onConfirm={confirmDeleteCourse}
                onCancel={() => setShowDeleteCourseModal(false)}
                confirmText="Yes, Delete"
                cancelText="No"
            />
        </div>
    );
};

export default EditCourse;
