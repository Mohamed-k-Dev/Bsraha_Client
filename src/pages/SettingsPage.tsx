import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Lock,
  Camera,
  Image as ImageIcon,
  AlertTriangle,
  LogOut,
  Mail,
  Phone,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui";
import { Avatar } from "@/components/Avatar";
import { cn } from "@/utils";
import { toast } from "react-toastify";
import {
  updateProfileInfo,
  updatePassword,
  uploadProfileImageApi,
  uploadCoverImagesApi,
  getUserProfile,
} from "@/api/user.api";

export function SettingsPage() {
  const { logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [active, setActive] = useState<"profile" | "photos" | "password">(
    "profile"
  );
  const [loadingProfileData, setLoadingProfileData] = useState(true);

  // Profile Form States
  const [userName, setUserName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [userProfileData, setUserProfileData] = useState<any>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Fetch latest profile data from api/v1/user/profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getUserProfile();
        if (profile) {
          setUserProfileData(profile);
          setUserName(profile.userName ?? "");

          // Strip any existing @Bsraha or @ so the user only sees/edits their base name
          const rawDisplayName = profile.displayName ?? "";
          const cleanDisplayName = rawDisplayName
            .replace(/@Bsraha/gi, "")
            .replace(/@/g, "")
            .trim();
          setDisplayName(cleanDisplayName);

          setEmail(profile.email ?? "");
          setGender(profile.gender ?? "");
          setAge(profile.age ?? "");
          setPhone(profile.phone ?? "");
        }
      } catch (err: any) {
        toast.error("Failed to load profile details.");
      } finally {
        setLoadingProfileData(false);
      }
    };
    fetchProfile();
  }, []);

  // Password Form States
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Modal & File Upload States
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "profileImage" | "coverImages" | null;
    pendingFiles: File[] | null;
  }>({
    isOpen: false,
    type: null,
    pendingFiles: null,
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Handle display name input change and prevent `@` typing
  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = e.target.value.replace(/@/g, "");
    setDisplayName(sanitizedValue);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = displayName.replace(/@/g, "").trim();

    if (!cleanName) {
      toast.error("Display name cannot be empty.");
      return;
    }

    // AUTOMATICALLY APPEND @Bsraha BEFORE SAVING
    const finalDisplayName = `${cleanName}@Bsraha`;

    setSavingProfile(true);
    try {
      const res = await updateProfileInfo({
        userName,
        displayName: finalDisplayName,
        gender,
        age,
        phone,
      });
      updateUser(res.data.user);
      setUserProfileData(res.data.user);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      await updatePassword({ oldPassword, newPassword, confirmPassword });
      toast.success("Password updated successfully! Please log in again.");
      logout();
      navigate("/");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleFileSelected = (
    type: "profileImage" | "coverImages",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setModalConfig({
      isOpen: true,
      type,
      pendingFiles: fileList,
    });
    e.target.value = "";
  };

  const confirmUpload = async () => {
    if (!modalConfig.type || !modalConfig.pendingFiles) return;
    setUploadingImage(true);

    try {
      if (modalConfig.type === "profileImage") {
        const res = await uploadProfileImageApi(modalConfig.pendingFiles[0]);
        const updated = res.data?.user || res.data;
        updateUser(updated);
        setUserProfileData((prev: any) => ({ ...prev, image: updated.image }));
        toast.success("Profile image updated successfully!");
      } else if (modalConfig.type === "coverImages") {
        const res = await uploadCoverImagesApi(modalConfig.pendingFiles);
        const updated = res.data?.user || res.data;
        updateUser(updated);
        setUserProfileData((prev: any) => ({
          ...prev,
          coverImages: updated.coverImages,
        }));
        toast.success("Cover images updated successfully!");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
      setModalConfig({ isOpen: false, type: null, pendingFiles: null });
    }
  };

  const sections = [
    { id: "profile", label: "Profile Details", icon: User },
    { id: "photos", label: "Photos & Covers", icon: Camera },
    { id: "password", label: "Security & Password", icon: Lock },
  ];

  const coverImagesList = userProfileData?.coverImages || [];
  const lastCoverImage =
    coverImagesList.length > 0
      ? coverImagesList[coverImagesList.length - 1]
      : null;

  if (loadingProfileData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" className="text-ember-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl sm:text-4xl font-light text-ink-900">
          Account <span className="italic font-medium">Settings</span>
        </h1>
        <p className="mt-2 text-ink-500 text-pretty">
          Manage your personal information, profile media, and password.
        </p>
      </motion.div>

      {/* Section navigation tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id as any)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all shrink-0",
              active === s.id
                ? "bg-ink-900 text-paper-50 shadow-sm"
                : "bg-paper-50 text-ink-600 border border-ink-200 hover:border-ink-400"
            )}
          >
            <s.icon className="h-4 w-4" /> {s.label}
          </button>
        ))}
      </div>

      {/* Profile Details Section */}
      {active === "profile" && (
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSaveProfile}
          className="card p-6 sm:p-8 space-y-6"
        >
          <div className="flex items-center gap-4 pb-6 border-b border-ink-100">
            {userProfileData?.image?.url ? (
              <img
                src={userProfileData.image.url}
                alt="Profile"
                className="h-16 w-16 rounded-full object-cover border border-ink-200 shadow-sm"
              />
            ) : (
              <Avatar
                name={displayName || userName}
                seed={userName || "seed"}
                size="lg"
              />
            )}
            <div>
              <div className="font-display text-lg font-semibold text-ink-800">
                {displayName ? `${displayName}@Bsraha` : userName}
              </div>
              <div className="text-sm text-ink-400 font-mono">@{userName}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                Display Name
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={displayName}
                  onChange={handleDisplayNameChange}
                  placeholder="e.g. mohamed"
                  className="input pr-20"
                  required
                />
                <span className="absolute right-3 text-xs font-bold text-ink-400 font-mono pointer-events-none select-none">
                  @Bsraha
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-400 font-mono">
                Will be saved as:{" "}
                <strong className="text-ink-700">
                  {displayName ? `${displayName}@Bsraha` : "@Bsraha"}
                </strong>
              </p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                Email (Read-only)
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  disabled
                  className="input bg-ink-50 text-ink-500 cursor-not-allowed pl-10"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+20..."
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="input bg-white"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <button
              type="submit"
              disabled={savingProfile}
              className="w-full btn btn-ember text-sm py-3 flex items-center justify-center gap-2 shadow-sm"
            >
              {savingProfile ? <Spinner size="sm" /> : <>Save Changes</>}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full btn text-sm py-3 border border-red-300 text-red-600 hover:bg-red-50 transition flex items-center justify-center gap-2 font-medium"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </motion.form>
      )}

      {/* Photos & Covers Section */}
      {active === "photos" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <input
            type="file"
            ref={profileInputRef}
            onChange={(e) => handleFileSelected("profileImage", e)}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={coverInputRef}
            onChange={(e) => handleFileSelected("coverImages", e)}
            accept="image/*"
            multiple
            className="hidden"
          />

          <div className="card p-8 flex flex-col items-center text-center">
            <h3 className="font-display font-semibold text-lg text-ink-900 mb-2">
              Profile Image
            </h3>
            <p className="text-sm text-ink-500 mb-6">
              Your current primary avatar displayed across the app.
            </p>

            <div
              className="relative group cursor-pointer"
              onClick={() => profileInputRef.current?.click()}
            >
              {userProfileData?.image?.url ? (
                <img
                  src={userProfileData.image.url}
                  alt="Profile"
                  className="h-36 w-36 rounded-full object-cover border-4 border-white shadow-md group-hover:opacity-90 transition"
                />
              ) : (
                <div className="h-36 w-36 rounded-full bg-ink-100 flex items-center justify-center border-4 border-white shadow-md">
                  <User className="h-16 w-16 text-ink-400" />
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-ink-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                <Camera className="h-8 w-8" />
              </div>
            </div>
            <button
              onClick={() => profileInputRef.current?.click()}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-medium bg-ink-100 hover:bg-ink-200 text-ink-700 transition"
            >
              Change Profile Photo
            </button>
          </div>

          <div className="card p-8 flex flex-col items-center text-center">
            <h3 className="font-display font-semibold text-lg text-ink-900 mb-2">
              Cover Images
            </h3>
            <p className="text-sm text-ink-500 mb-6">
              Your latest active cover banner shown at the top of your public
              profile.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {lastCoverImage ? (
                <div className="relative h-36 w-72 rounded-2xl overflow-hidden shadow-md border-2 border-white">
                  <img
                    src={lastCoverImage.url || lastCoverImage}
                    alt="Latest Cover"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                    Latest
                  </span>
                </div>
              ) : (
                <div className="h-28 w-64 rounded-xl bg-ink-100 flex items-center justify-center border border-ink-200 text-ink-400 text-xs">
                  <ImageIcon className="h-5 w-5 mr-2" /> No cover images
                  uploaded
                </div>
              )}
            </div>

            <button
              onClick={() => coverInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-ink-900 text-white hover:bg-ink-800 transition flex items-center gap-2 shadow-sm"
            >
              <Camera className="h-4 w-4" /> Manage & Upload Covers
            </button>
          </div>
        </motion.div>
      )}

      {/* Security & Password Section */}
      {active === "password" && (
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSavePassword}
          className="card p-6 sm:p-8 space-y-6"
        >
          <div className="border-b border-ink-100 pb-4">
            <h3 className="font-display font-semibold text-lg text-ink-900">
              Change Password
            </h3>
            <p className="text-sm text-ink-500 mt-0.5">
              Ensure your account is using a secure password. Changing your
              password will invalidate your active sessions.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                Old Password
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={savingPassword}
              className="w-full btn btn-ember text-sm py-3 flex items-center justify-center gap-2 shadow-sm"
            >
              {savingPassword ? <Spinner size="sm" /> : <>Update Password</>}
            </button>
          </div>
        </motion.form>
      )}

      {/* CONFIRMATION MODAL BEFORE UPLOADING */}
      <AnimatePresence>
        {modalConfig.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50 backdrop-blur-sm"
            onClick={() =>
              !uploadingImage &&
              setModalConfig({ isOpen: false, type: null, pendingFiles: null })
            }
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-ink-100 text-center"
            >
              <div className="h-12 w-12 rounded-2xl bg-ember-100 text-ember-600 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-ink-900 mb-2">
                Confirm Upload
              </h3>
              <p className="text-sm text-ink-600 mb-6 text-pretty">
                {modalConfig.type === "profileImage"
                  ? "Are you sure you want to replace your profile photo with this image?"
                  : `Are you sure you want to upload these ${
                      modalConfig.pendingFiles?.length ?? 0
                    } cover image(s)?`}
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() =>
                    setModalConfig({
                      isOpen: false,
                      type: null,
                      pendingFiles: null,
                    })
                  }
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-ink-100 hover:bg-ink-200 text-ink-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={confirmUpload}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-ember-500 hover:bg-ember-600 text-white transition flex items-center justify-center gap-2"
                >
                  {uploadingImage ? <Spinner size="sm" /> : "Confirm"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
