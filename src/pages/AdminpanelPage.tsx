import { Calendar, CheckSquare, Filter, Plus, Users, X, XSquare, Edit, Trash2 } from 'lucide-react';
import '../assets/css/adminpanelpage.css';
import { IElection, UserContext } from '../assets/js/UserContext';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { formatDate, Role } from '../assets/js/helper';


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
// type react_state_array_int = React.Dispatch<React.SetStateAction<number[]>>;
// type react_state_array_str = React.Dispatch<React.SetStateAction<string[]>>;
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
            console.log(opts, id)
            const new_opts = opts.filter(opt => opt.id !== id)
            console.log(new_opts)
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
        console.log(pollData)


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
                console.log("Success:", data);
                toast.success(data.msg || (editingPoll ? 'Poll Updated!' : 'Poll Created!'));
                setFormPollModal(false);
                clearEditing();
            } else {
                setSendingDataSpinner(false)
                console.error("Error:", data);
                toast.warning(data.msg || 'Check your inputs.')
            }
        } catch (error) {
            setSendingDataSpinner(false)
            console.error("Catch Sending Data failed error:", error);
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
export default function Adminpanelpage({ role }: { role: Role }) {
    const context = useContext(UserContext);
    const [PollsData, setPollsData] = useState<IElection[]>([]);
    const [poll_form_modal, setFormPollModal] = useState(false);
    const [editingPoll, setEditingPoll] = useState<IElection | null>(null);
    const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'closed'>('all'); // Add selectedTab state

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

    // Filter PollsData based on the selected tab
    const filteredPollsData = PollsData.filter((poll) => {
        if (selectedTab === 'all') {
            return true;
        } else if (selectedTab === 'active') {
            return newStatus(poll.endDate);
        } else if (selectedTab === 'closed') {
            return !newStatus(poll.endDate);
        }
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
                    <p className="caption">Manage polls and view results</p>
                </div>
                <button onClick={() => { setEditingPoll(null); setFormPollModal(true); }} className="primary-btn">
                    <Plus />
                    Create New Poll
                </button>
            </section>
            <section className='polls-section'>
                <div className='row head'>
                    <h3>Manage Polls</h3>
                    <div className='row tab-btns'>
                        <button
                            className={selectedTab === 'all' ? 'active' : ''}
                            onClick={() => setSelectedTab('all')}>
                            <Filter /> All
                        </button>
                        <button
                            className={selectedTab === 'active' ? 'active' : ''}
                            onClick={() => setSelectedTab('active')}>
                            <CheckSquare /> Active
                        </button>
                        <button
                            className={selectedTab === 'closed' ? 'active' : ''}
                            onClick={() => setSelectedTab('closed')}>
                            <XSquare /> Closed
                        </button>
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
                                        <span className={`status ${newStatus(poll.endDate)?'active' : 'closed'}`}>
                                            {newStatus(poll.endDate) ? 'ongoing' : 'ended'}
                                        </span>
                                    </div>
                                    <p className="poll-description">{poll.description}</p>
                                </td>
                                <td data-label="Created" className='date caption'>{formatDate(poll.startDate)}</td>
                                <td data-label="End Date" className='date caption'>{formatDate(poll.endDate)}</td>
                                <td data-label="Voters" className='users-row'><Users /> {poll.options.length}</td>
                                <td data-label="Status">
                                    <button className={"action-btn " + (newStatus(poll.endDate) ? 'active' : 'close')}>
                                        {newStatus(poll.endDate) ? (
                                            <>
                                                <CheckSquare /> Active
                                            </>
                                        ) : (
                                            <>
                                                <X /> Ended
                                            </>
                                        )}
                                    </button>
                                </td>
                                <td data-label="Actions">
                                    <div className="row" style={{ gap: '10px' }}>
                                        <button 
                                            className="grey-btn" 
                                            style={{ padding: '5px' }}
                                            onClick={() => { setEditingPoll(poll); setFormPollModal(true); }}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            className="grey-btn delete-btn" 
                                            style={{ padding: '5px', color: '#ff4d4d' }}
                                            onClick={() => handleDelete(poll._id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}

