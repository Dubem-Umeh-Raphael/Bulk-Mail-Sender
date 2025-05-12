import React from 'react';
import { Link } from 'react-router-dom';
// import { FaExclamationTriangle } from 'react-icons/fa';
import { TriangleAlert } from 'lucide-react';

const PageNotFound = () => {
  return (
    <div className='mb-auto bg-gradient-to-br from-orange-300 to-blue-300 min-h-screen flex items-center justify-center'>
      <section className="text-center flex flex-col justify-center items-center">
        <TriangleAlert size={90} className='text-yellow-400 mb-4' />
        <h1 className="text-xl md:text-6xl font-bold mb-4">404 Not Found</h1>
        <p className="text-xl mb-5">This page does not exist</p>
        <div className='flex flex-col items-center'>
          <Link
            to="/"
            className="text-white bg-indigo-700 hover:bg-indigo-900 rounded-md px-3 py-2 mt-4">Go Back
          </Link>

          <span className="text-white bg-green-700 hover:bg-green-900 rounded-md px-3 py-2 mt-4">
            <Link to='https://x.com/@dubem_umeh' target='_blank'>Contact Dev</Link>
          </span>
        </div>
    </section>
    </div>
  )
}

export default PageNotFound