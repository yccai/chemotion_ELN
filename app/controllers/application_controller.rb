class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  before_action :check_referer_repo, :authenticate_user!
  protect_from_forgery with: :null_session, if: Proc.new { |c| c.request.format == 'application/json' }

  before_action :configure_permitted_parameters, if: :devise_controller?

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:first_name, :last_name, :name_abbreviation])
  end

  # if we go from repository then redirect to sign in page
  def check_referer_repo
    if request.path == '/home' && request.referer.to_s.include?('http://www.chemotion.net')
      redirect_to new_user_session_path
    end
  end
end
