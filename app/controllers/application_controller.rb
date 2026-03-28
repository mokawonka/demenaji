class ApplicationController < ActionController::Base
  helper_method :current_user, :signed_in?

  private

  def current_user
    @current_user ||= User.find_by(id: session[:user_id])
  end

  def signed_in?
    current_user.present?
  end

  def require_login
    unless signed_in?
      if request.xhr?
        head :unauthorized
      else
        redirect_to login_path
      end
    end
  end

end
