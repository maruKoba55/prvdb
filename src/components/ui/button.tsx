type Props = {
  label: React.ReactNode;
  variant?: 'blue' | 'red' | 'orange' | 'outline';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void | null>;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
  disabled?: boolean;
};

export const CommonButton = ({ label, variant = 'blue', onClick, title, disabled, type = 'button' }: Props) => {
  // 1. 共通の土台クラス
  const baseStyle =
    'flex items-center gap-2 relative z-10 py-2 px-2 text-base rounded-md font-semibold transition-all duration-300 cursor-pointer disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:transform-none';

  // 2. variantごとのクラス
  const variantStyles = {
    blue: 'bg-blue-600 border-none text-white hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0',
    red: 'bg-red-600 border-none text-white hover:bg-red-700 hover:-translate-y-0.5 active:translate-y-0',
    orange: 'bg-orange-500 border-none text-white hover:bg-orange-700 hover:-translate-y-0.5 active:translate-y-0',
    outline:
      'bg-transparent border-2 border-gray-400 text-gray-700 hover:bg-gray-100 hover:-translate-y-0.5 active:translate-y-0'
  };

  return (
    <button
      type={type}
      title={title}
      className={`${baseStyle} ${variantStyles[variant]}`}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
