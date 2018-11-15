import React from 'react';
import FA from 'react-fontawesome';

class Authorization extends React.Component {
    async componentDidMount() {
        if(!this.props.development) {
            await this.props.checkAuthentication();
            if(!this.props.authenticated) {
                console.log("not authenticated", this.props);
                setTimeout(() => {
                    return window.location = "/login?returnUrl=/config";
                }, 5000);
            }
            if(!this.props.iaaAuth)
            {
                console.log("not IAA", this.props);
                setTimeout(() => {
                   return window.location = this.props.iaaCheck; 
                }, 5000)
                
            }
        }
    }
    render() {
        return (
            <div>
                This is the loading page. Checking auth. <FA name="spinner" spin={true} /> 
            </div>          
        )
    }
}

export default Authorization;