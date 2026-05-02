import { Box } from 'lucide-react'
import React, { use, useEffect } from 'react'
import Button from './ui/Button';
import { useOutletContext } from 'react-router';
import { signIn, signOut } from '../lib/puter.action';
import type { AuthContext } from '../type';


const Navbar = () => {
    const {isSignedIn,userName,signIn,signOut}=useOutletContext<AuthContext>();
    const handleAuthClick = async()=>{
        if(isSignedIn){
            try{
                await signOut();
            }catch(e){
                console.error("Error signing out:", e);
            }
            return;
        }
        try{
            await signIn();
        }catch(e){
            console.error("Error signing in:", e);
        }

    }
  return (
      <header className="navbar">
        <nav className="inner">
            <div className ="left">
                <div className="brand">
                    <Box className="logo"/>
                     <span className="name">Roomify</span>
                </div>
                <ul className="links">
                    <a href="#" className="link">Product</a>
                    <a href="#" className="link">Pricing</a>
                    <a href="#" className="link">Community</a>
                    <a href="#" className="link">Enterprise</a>
                </ul>
            </div>
            <div className="actions">
                {isSignedIn ? (
                    <>
                    <span className="greeting">{userName ? `Hi, ${userName}`: 'Signed In'}</span>
                    <Button size ="sm" onClick={handleAuthClick} className="btn">Log Out</Button>
                    </>
                ) : (
                    <>
                    <Button size ="sm" variant="ghost" onClick ={handleAuthClick} className="Login">Log In</Button>
                    <a href="#upload" className="cta">Get Started</a>
                    </>
                )}
            </div>
        </nav>
       </header>
  )
}

export default Navbar
