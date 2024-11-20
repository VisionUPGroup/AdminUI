import { useState, FormEvent, ChangeEvent } from 'react';
import { Eye, EyeOff, User, Lock } from 'react-feather';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useAppSelector } from "@/Redux/Hooks";
import { useAuthService } from "../../../../Api/authService";
import './LoginPageStyles.scss';

const LoginPage = () => {
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const [formValues, setFormValues] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuthService();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await login(formValues.username, formValues.password);
      
      if (response && response.accessToken) {
        Cookies.set("token", response.accessToken);
        Cookies.set("roleId", response.user.roleID);
        Cookies.set("userData", JSON.stringify({
          username: response.user.username,
          roleId: response.user.roleID,
        }));
        
        toast.success("Login successful");
        
        if (response.user.roleID === 2) {
          router.push(`/en/welcomestaff`);
        } else if (response.user.roleID === 3) {
          router.push(`/en/welcomeadmin`);
        } else {
          router.push(`${process.env.PUBLIC_URL}/dashboard`);
        }
      } else {
        toast.error("Please Enter Valid Username Or Password");
      }
    } catch (error) {
      toast.error("Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Vison Up</h1>
          <p>Please sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <User className="input-icon" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formValues.username}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <Lock className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formValues.password}
              onChange={handleInputChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password">Forgot Password?</a>
          </div>

          <button 
            type="submit" 
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loader"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;