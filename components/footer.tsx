import React from 'react';
import './footer.css'
import { Facebook } from 'lucide-react';
import { Instagram } from 'lucide-react';
import { Github } from 'lucide-react';
const Footer = () => (
  <footer className="bg-light p-3 text-center" data-testid="footer">
    <div className="footer">
        <div className="row">
            <a href="#"><div className='i'><Facebook /></div></a>
            <a href="https://www.instagram.com/karmveersinh_rana_?igsh=MjZqeXgxZ2l5YmFy&utm_source=qr"><div className='c'><Instagram /></div></a>
            <a href="https://github.com/Krushang16"><div className='n'><Github /></div></a>
        </div>

        <div className="row">
            <ul>
            <li><a href="#">Contact us</a></li>
            <li><a href="#">Our Services</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms & Conditions</a></li>
            <li><a href="#">Career</a></li>
            </ul>
        </div>
        <div className="row">
             Copyright © 2025  - All rights reserved || Designed By: 8CE_P022 
        </div>
        <div className="new_footer_top">
            <div className="footer_bg">
                <div className="footer_bg_one"></div>
                <div className="footer_bg_two"></div>
            </div>
        </div>    
    </div>
  </footer>
);

export default Footer;