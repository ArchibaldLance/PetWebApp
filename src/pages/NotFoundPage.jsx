import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  useEffect(() => {
    document.title = 'Az oldal nem található | Háziállat nyilvántartó';
  }, []);

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Az oldal nem található</h2>
          <p className="page-description">
            A megnyitni kívánt oldal nem létezik vagy már nem érhető el.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="stack">
          <div className="empty-state">
            Ellenőrizd a címet, vagy térj vissza valamelyik elérhető oldalra.
          </div>

          <div className="action-group">
            <Link to="/" className="button button-primary">
              Vissza a főoldalra
            </Link>

            <Link to="/admin" className="button button-secondary">
              Admin oldal megnyitása
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}