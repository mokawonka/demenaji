class UsersController < ApplicationController
  
  def new
    @user = User.new
  end


  def create
    @user = User.new(user_params)
    @user.email = @user.email.to_s.downcase
    @user.name  = @user.email.split("@").first

    if @user.save
      session[:user_id] = @user.id
      redirect_to root_path
    else
      render :new, status: :unprocessable_entity
    end
  end


  def my_profile
    @user = current_user
  end


  def update_profile
    @user = current_user

    if @user.update(user_params)
      flash[:notice] = 'Profil mis à jour avec succès.'
      redirect_to my_profile_path
    else
      flash.now[:alert] = @user.errors.full_messages.join(', ')
      render :my_profile, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:name, :email, :password, :password_confirmation,
                                  :profile_picture, :job_title, :phone_number)
  end
end
