import { useState, useEffect, type FormEvent } from 'react';
import { addOption } from '../lib/optionService';
import { getUserPolls, PollWithPermission } from '../lib/pollsService';
import { useAuth } from '../hooks/useAuth';
import dropdownIcon from '../assets/dropdown-icon.svg';

interface AddTermModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPollId?: number;
}

const AddTermModal = ({ isOpen, onClose, initialPollId }: AddTermModalProps) => {
  const { user } = useAuth();
  const [term, setTerm] = useState('');
  const [pollId, setPollId] = useState<number | ''>('');
  const [polls, setPolls] = useState<PollWithPermission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
       getUserPolls(user.id).then(setPolls).catch(console.error);
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (initialPollId) {
      setPollId(initialPollId);
    }
  }, [initialPollId, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pollId || !term.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await addOption(Number(pollId), term.trim());
      setTerm('');
      setSuccess(true);
      setTimeout(() => {
         setSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Error al añadir el término');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed-overlay">
      <div className="card mw-500 w-100" style={{ margin: '1rem' }}>
        <div className="card-header flex justify-between items-center">
            <h3 className="text-large font-medium">Añadir Nuevo Término</h3>
            <button onClick={onClose} className="btn btn-sm btn-close" style={{padding: '4px 8px', lineHeight: 1}}>✕</button>
        </div>
        <div className="card-body gap-md">
            <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
                <div className="flex flex-col gap-xs">
                    <label className="text-small text-muted" htmlFor="pollId" >Encuesta</label>
                    <div className="select-box">
                      <select
                        name="pollId"
                        id="pollId"
                        value={pollId}
                        onChange={(e) => setPollId(Number(e.target.value))}
                        required
                      >
                        <option value="" disabled>Selecciona una encuesta</option>
                        {polls.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                      <img src={dropdownIcon} alt="" />
                    </div>
                </div>

                <div className="flex flex-col gap-xs">
                     <label className="text-small text-muted">Término</label>
                     <input
                        type="text"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        placeholder="Escribe el término..."
                        required
                        className="w-100"
                     />
                </div>

                {error && <div className="text-error">{error}</div>}
                {success && <div className="text-success" style={{color: 'var(--clr-success)'}}>Término añadido correctamente</div>}

                <div className="flex justify-end gap-sm mt-md">
                    <button type="submit" disabled={isLoading} className="btn btn-primary">
                        {isLoading ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AddTermModal;
