import { Calendar, CheckSquare, Filter, Plus, Users, X, XSquare, Edit, Trash2, LayoutDashboard, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import '../assets/css/adminpanelpage.css';
import { IElection, UserContext } from '../assets/js/UserContext';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { formatDate, Role } from '../assets/js/helper';
import MyBarChart from '../ui/MyBarChart';


function Option({ placeholder, removeMe, myid, value, onChange }: {
    placeholder: string;
    removeMe: (id: number) => void;
    myid: number;
    value: string;
    onChange: (id: number, newValue: string) => void;
}) {

    return (
        <div className='width100per option flex'>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(myid, e.target.value)}
            />
            <button
                onClick={(e) => {
                    e.preventDefault();
                    removeMe(myid)
                }}
                className='align-self-cen justify-self-cen flex algin-items-cen justify-content-cen'>
                <X />
            </button>
        </div>
    )
}

type PollFormProps = {
    setFormPollModal: React.Dispatch<React.SetStateAction<boolean>>;
    editingPoll: IElection | null;
    clearEditing: () => void;
};

function PollForm({ setFormPollModal, editingPoll, clearEditing }: PollFormProps) {
    const [title, setTitle] = useState(editingPoll ? editingPoll.title : 'Time For MTH Lecture');
    const [description, setDescription] = useState(editingPoll ? editingPoll.description : 'Chose Time for MTH Class');
    const [endDate, setEndDate] = useState(() => {
        if (editingPoll && editingPoll.endDate) {
            return new Date(editingPoll.endDate).toISOString().split('T')[0];
        }
        const now = new Date();
        now.setDate(now.getDate() + 3);
        return now.toISOString().split('T')[0];
    });

    const [options, setOptions] = useState<{ id: number, value: string }[]>(() => {
        if (editingPoll && editingPoll.options) {
            return editingPoll.options.map((opt, index) => ({ id: index + 1, value: opt.text }));
        }
        return [
            { id: 1, value: '8AM' },
            { id: 2, value: '3PM' }
        ];
    });
    const [sendind_data_spinner, setSendingDataSpinner] = useState(false);


    function removeMe(id: number) {
        setOptions(opts => {
            const new_opts = opts.filter(opt => opt.id !== id)
            return new_opts
        })

    }
    function updateOption(id: number, newValue: string) {
        setOptions((opts) =>
            opts.map(opt => opt.id === id ? { ...opt, value: newValue } : opt)
        );
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault()
        if (!title || options.length < 2) {
            toast.error('Please provide a title and at least two options for the poll.');
            return;
        }
        setSendingDataSpinner(true)
        const pollData = {
            title,
            description,
            endDate,
            options: options.map(opt => opt.value)
        };


        try {
            const url = editingPoll 
                ? `${import.meta.env.VITE_API_URL}/admin/edit-election/${editingPoll._id}`
                : `${import.meta.env.VITE_API_URL}/admin/add-election`;
            const method = editingPoll ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(pollData),
            });

            const data = await response.json();

            if (response.ok) {
                setSendingDataSpinner(false)
                toast.success(data.msg || (editingPoll ? 'Poll Updated!' : 'Poll Created!'));
                setFormPollModal(false);
                clearEditing();
            } else {
                setSendingDataSpinner(false)
                toast.warning(data.msg || 'Check your inputs.')
            }
        } catch (error) {
            setSendingDataSpinner(false)
            toast.error('Something went wrong -' + error);
        }
    }
    return (
        <div className='modal poll-form'>
            {sendind_data_spinner &&
                <div className='modal'>
                    <div id="spinner" className="spinner"></div>
                </div>
            }
            <div className='header flex flex-wrap space-between'>
                <div>
                    <h1>Admin Panel</h1>
                    <p className='caption'>Manage polls and view results</p>
                </div>
                <button onClick={() => { setFormPollModal(false); clearEditing(); }} className='primary-btn flex algin-items-cen'><XSquare /> Cancel</button>
            </div>
            <form onSubmit={handleSubmit}>
                <label>Poll Title</label>
                <input
                    type='text'
                    placeholder='what is ...'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <label>Description (optional)</label>
                <input
                    type='text'
                    placeholder='Provide more context for your poll'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <label htmlFor='date' >End Date (optional)</label>
                <input
                    type="date"
                    name=""
                    id="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
                <hr />

                <label>Poll Options</label>
                {options.map((opt, index) => (
                    <Option
                        key={opt.id}
                        myid={opt.id}
                        placeholder={`Option ${index + 1}`}
                        removeMe={removeMe}
                        value={opt.value}
                        onChange={updateOption}
                    />
                ))}
                <button onClick={(e) => {
                    e.preventDefault();
                    setOptions(old_options => [
                        ...old_options,
                        { id: old_options.length ? old_options[old_options.length - 1].id + 1 : 1, value: '' }
                    ])
                }}
                    className='add-option-btn grey-btn flex algin-items-cen justify-content-cen'>
                    <Plus />
                    Add Option
                </button>
                <hr />
                <div className='align-self-end'>
                    <button onClick={() => { setFormPollModal(false); clearEditing(); }} className='grey-btn'>Cancel</button>
                    <button className='create-poll-btn primary-btn'>{editingPoll ? 'Update Poll' : 'Create Poll'}</button>
                </div>
            </form>
        </div>
    )
}


function AnalyticsView() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/analytics`, {
                    credentials: "include",
                });
                const data = await response.json();
                if (response.ok) {
                    setAnalytics(data);
                } else {
                    toast.error(data.msg || 'Error fetching analytics');
                }
            } catch (error) {
                console.error(error);
                toast.error('Network error fetching analytics');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="flex justify-content-cen align-items-cen" style={{ padding: '50px' }}><div className="spinner"></div></div>;
    if (!analytics) return <p className="caption">No analytics data available.</p>;

    return (
        <div className="analytics-view">
            <div className="preview-stats-box" style={{ marginBottom: '30px' }}>
                <div className="card">
                    <div className="row title-box">
                        <span>
                            <h3>Total Students</h3>
                            <strong>{analytics.overview.totalStudents}</strong>
                        </span>
                        <Users className="badge blue" />
                    </div>
                </div>
                <div className="card">
                    <div className="row title-box">
                        <span>
                            <h3>Voted Students</h3>
                            <strong>{analytics.overview.studentsWhoVoted}</strong>
                        </span>
                        <CheckSquare className="badge green" />
                    </div>
                </div>
                <div className="card">
                    <div className="row title-box">
                        <span>
                            <h3>Total Votes</h3>
                            <strong>{analytics.overview.totalVotes}</strong>
                        </span>
                        <TrendingUp className="badge purple" />
                    </div>
                </div>
                <div className="card">
                    <div className="row title-box">
                        <span>
                            <h3>Participation Rate</h3>
                            <strong>{analytics.overview.participationRate}%</strong>
                        </span>
                        <PieChartIcon className="badge yellow" />
                    </div>
                </div>
            </div>

            <section className="polls-section">
                <div className="flex space-between align-items-cen">
                    <h3>Top 5 Popular Polls</h3>
                    <div className="flex" style={{ gap: '10px' }}>
                        <button 
                            className="grey-btn flex algin-items-cen" 
                            style={{ fontSize: '13px', padding: '8px 15px' }}
                            onClick={async () => {
                                if (!confirm('This will WIPE all existing polls/students and generate new ones. Proceed?')) return;
                                try {
                                    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/simulation/generate`, { method: 'POST', credentials: 'include' });
                                    const data = await res.json();
                                    if (res.ok) { toast.success(data.msg); window.location.reload(); }
                                    else toast.error(data.msg);
                                } catch (e) { toast.error('Request failed'); }
                            }}
                        >
                            <TrendingUp size={16} /> Seed Simulation
                        </button>
                        <button 
                            className="grey-btn flex algin-items-cen" 
                            style={{ fontSize: '13px', padding: '8px 15px', color: '#ff4d4d' }}
                            onClick={async () => {
                                if (!confirm('DANGER: This will delete ALL polls and students permanently. Proceed?')) return;
                                try {
                                    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/simulation/clear`, { method: 'DELETE', credentials: 'include' });
                                    const data = await res.json();
                                    if (res.ok) { toast.success(data.msg); window.location.reload(); }
                                    else toast.error(data.msg);
                                } catch (e) { toast.error('Request failed'); }
                            }}
                        >
                            <Trash2 size={16} /> Wipe Database
                        </button>
                    </div>
                </div>
                <div className="main-votings-box" style={{ marginTop: '20px' }}>
                    <div className="voting-card" style={{ maxWidth: '100%' }}>
                        <MyBarChart 
                            card_width={800} 
                            students={analytics.popularPolls.map((p: any) => p.title)} 
                            votes={analytics.popularPolls.map((p: any) => p.count)} 
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function Adminpanelpage({ role }: { role: Role }) {
    const context = useContext(UserContext);
    const [PollsData, setPollsData] = useState<IElection[]>([]);
    const [poll_form_modal, setFormPollModal] = useState(false);
    const [editingPoll, setEditingPoll] = useState<IElection | null>(null);
    const [view, setView] = useState<'manage' | 'analytics'>('manage');
    const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'closed'>('all');

    function newStatus(endDate: string | undefined) {
        if (!endDate) return false;
        const today = new Date();
        return new Date(endDate) >= today;
    }

    useEffect(() => {
        if (context?.PollsData) {
            setPollsData(context.PollsData);
        }
    }, [context?.PollsData]);

    if (role !== 'admin') {
        return <p>Protected Route</p>;
    }

    const filteredPollsData = PollsData.filter((poll) => {
        if (selectedTab === 'all') return true;
        if (selectedTab === 'active') return newStatus(poll.endDate);
        if (selectedTab === 'closed') return !newStatus(poll.endDate);
        return true;
    });

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this poll?')) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/delete-election/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok) {
                toast.success(data.msg || 'Poll deleted');
            } else {
                toast.error(data.msg || 'Error deleting poll');
            }
        } catch (error) {
            toast.error('Error deleting poll');
        }
    };

    return (
        <div className="adminpage page" style={{ overflowY: poll_form_modal ? 'hidden' : 'auto' }}>
            {poll_form_modal && <PollForm setFormPollModal={setFormPollModal} editingPoll={editingPoll} clearEditing={() => setEditingPoll(null)} />}
            <section className="heading">
                <div>
                    <h1>Admin Panel</h1>
                    <p className="caption">Manage polls and view engagement metrics</p>
                </div>
                <div className="row" style={{ gap: '10px' }}>
                    <button 
                        className={`grey-btn flex algin-items-cen ${view === 'manage' ? 'active' : ''}`}
                        onClick={() => setView('manage')}
                        style={{ background: view === 'manage' ? '#4ec9e6' : '', color: view === 'manage' ? 'white' : '' }}
                    >
                        <Filter size={18} /> Manage
                    </button>
                    <button 
                        className={`grey-btn flex algin-items-cen ${view === 'analytics' ? 'active' : ''}`}
                        onClick={() => setView('analytics')}
                        style={{ background: view === 'analytics' ? '#4ec9e6' : '', color: view === 'analytics' ? 'white' : '' }}
                    >
                        <LayoutDashboard size={18} /> Analytics
                    </button>
                    <button onClick={() => { setEditingPoll(null); setFormPollModal(true); }} className="primary-btn">
                        <Plus />
                        Create New Poll
                    </button>
                </div>
            </section>

            {view === 'manage' ? (
                <section className='polls-section'>
                    <div className='row head'>
                        <h3>Manage Polls</h3>
                        <div className='row tab-btns'>
                            <button className={selectedTab === 'all' ? 'active' : ''} onClick={() => setSelectedTab('all')}><Filter /> All</button>
                            <button className={selectedTab === 'active' ? 'active' : ''} onClick={() => setSelectedTab('active')}><CheckSquare /> Active</button>
                            <button className={selectedTab === 'closed' ? 'active' : ''} onClick={() => setSelectedTab('closed')}><XSquare /> Closed</button>
                        </div>
                    </div>
                    <div className='row sub-text caption'>
                        <Calendar />
                        <p>Showing {filteredPollsData.length} Polls</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Created</th>
                                <th>End Date</th>
                                <th><Users /></th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPollsData.map((poll) => (
                                <tr key={poll._id}>
                                    <td data-label="Title">
                                        <div className="poll-title">
                                            {poll.title}
                                            <span className={`status ${newStatus(poll.endDate) ? 'active' : 'closed'}`}>
                                                {newStatus(poll.endDate) ? 'ongoing' : 'ended'}
                                            </span>
                                        </div>
                                        <p className="poll-description">{poll.description}</p>
                                    </td>
                                    <td data-label="Created" className='date caption'>{formatDate(poll.startDate)}</td>
                                    <td data-label="End Date" className='date caption'>{formatDate(poll.endDate)}</td>
                                    <td data-label="Voters" className='users-row'><Users /> {poll.voters.length}</td>
                                    <td data-label="Status">
                                        <button className={"action-btn " + (newStatus(poll.endDate) ? 'active' : 'close')}>
                                            {newStatus(poll.endDate) ? <><CheckSquare /> Active</> : <><X /> Ended</>}
                                        </button>
                                    </td>
                                    <td data-label="Actions">
                                        <div className="row" style={{ gap: '10px' }}>
                                            <button className="grey-btn" style={{ padding: '5px' }} onClick={() => { setEditingPoll(poll); setFormPollModal(true); }}><Edit size={16} /></button>
                                            <button className="grey-btn delete-btn" style={{ padding: '5px', color: '#ff4d4d' }} onClick={() => handleDelete(poll._id)}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            ) : (
                <AnalyticsView />
            )}
        </div>
    );
}
