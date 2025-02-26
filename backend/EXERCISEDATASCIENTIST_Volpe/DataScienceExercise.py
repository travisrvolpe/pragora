import pandas as pd
import numpy as np
import re
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

df_f = pd.read_csv(
    "MA_Exer_PikesPeak_Females.txt",
    sep="\t",
    encoding="latin-1"
)

df_m = pd.read_csv("MA_Exer_PikesPeak_Males.txt",
                   sep="\t",
                   encoding="latin-1")

df_f["Gender"] = "F"
df_m["Gender"] = "M"
df = pd.concat([df_f, df_m], ignore_index=True)


def time_to_seconds(t_str):
    parts = t_str.split(":")
    parts = [float(p) for p in parts]
    if len(parts) == 2:
        return parts[0] * 60 + parts[1]
    elif len(parts) == 3:
        return parts[0] * 3600 + parts[1] * 60 + parts[2]
    else:
        return np.nan


def clean_race_data(df):
    df_clean = df.copy()

    def fix_state_abbreviation(row):
        if pd.notna(row['Gun Tim']) and bool(re.search('[A-Z]', str(row['Gun Tim']))):
            state_letter = re.search('[A-Z]', row['Gun Tim']).group()
            new_gun_time = re.sub('[A-Z]', '', row['Gun Tim']).strip()
            new_hometown = row['Hometown'].strip() + state_letter

            return pd.Series({
                'Hometown': new_hometown,
                'Gun Tim': new_gun_time
            })

        return pd.Series({
            'Hometown': row['Hometown'],
            'Gun Tim': row['Gun Tim']
        })

    fixed_columns = df_clean.apply(fix_state_abbreviation, axis=1)
    df_clean['Hometown'] = fixed_columns['Hometown']
    df_clean['Gun Tim'] = fixed_columns['Gun Tim']
    df_clean['Hometown'] = df_clean['Hometown'].str.strip()
    df_clean['Gun Tim'] = df_clean['Gun Tim'].str.strip()
    df_clean['Net Tim'] = df_clean['Net Tim'].str.replace('#', '').str.replace('D   ', '').str.replace('*', '')
    df_clean['Gun_Time_Sec'] = df_clean['Gun Tim'].apply(time_to_seconds)
    df_clean['Net_Time_Sec'] = df_clean['Net Tim'].apply(time_to_seconds)

    df_clean['Time_Diff_Sec'] = df_clean['Gun_Time_Sec'] - df_clean['Net_Time_Sec']

    df_clean = df_clean[df_clean['Ag'] >= 0]

    def get_age_group(age):
        if pd.isna(age):
            return 'Unknown'
        age = int(age)
        if age <= 14:
            return '0-14'
        elif age <= 19:
            return '15-19'
        else:
            lower = (age // 10) * 10
            upper = lower + 9
            return f'{lower}-{upper}'

    df_clean['Age_Group'] = df_clean['Ag'].apply(get_age_group)
    df_clean['Division'] = df_clean['Gender'] + '_' + df_clean['Age_Group']

    df_clean = df_clean.sort_values(['Division', 'Net_Time_Sec'])

    df_clean = df_clean.fillna({
        'Gun_Time_Sec': df_clean['Gun_Time_Sec'].mean(),
        'Net_Time_Sec': df_clean['Net_Time_Sec'].mean(),
        'Time_Diff_Sec': df_clean['Time_Diff_Sec'].mean()
    })

    return df_clean

cleaned_df = clean_race_data(df)
cleaned_df.to_csv('cleaned_race_data.csv', index=False)


def calculate_descriptive_stats(df, group_column, time_column):
    grouped = df.groupby(group_column)[time_column]

    def get_mode(x):
        mode_result = stats.mode(x)
        return float(mode_result.mode)

    stats_df = pd.DataFrame({
        'Mean': grouped.mean(),
        'Median': grouped.median(),
        'Mode': grouped.agg(get_mode),
        'Range': grouped.agg(lambda x: x.max() - x.min()),
        'Std Dev': grouped.std(),
        'Count': grouped.count()
    })

    stats_df['Mean_Formatted'] = pd.to_timedelta(stats_df['Mean'], unit='s').astype(str).str.slice(0, 8)
    stats_df['Median_Formatted'] = pd.to_timedelta(stats_df['Median'], unit='s').astype(str).str.slice(0, 8)

    stats_df = stats_df.round(2)

    return stats_df

stats = calculate_descriptive_stats(cleaned_df, 'Gender', 'Net_Time_Sec')

chris = cleaned_df.loc[cleaned_df["Name"] == "Chris Doe"].iloc[0]

same_division = cleaned_df[
    (cleaned_df["Gender"] == chris["Gender"]) &
    (cleaned_df["Age_Group"] == chris["Age_Group"])
]

cutoff_90 = np.percentile(same_division["Net_Time_Sec"], 10)
difference = chris["Net_Time_Sec"] - cutoff_90

division_stats = cleaned_df.groupby(["Gender", "Age_Group"])["Net_Time_Sec"].describe()


def visualize_race_analysis(df, chris_name="Chris Doe"):
    COLORS = {'F': '#2B5C8F', 'M': '#E67E22'}

    def format_time_mmss(seconds):
        minutes = int(seconds // 60)
        remaining_seconds = int(seconds % 60)
        return f"{minutes}:{remaining_seconds:02d}"

    fig = plt.figure(figsize=(20, 10))
    division_means = df.groupby(['Age_Group', 'Gender'])['Net_Time_Sec'].mean().unstack()

    bar_width = 0.35
    x = np.arange(len(division_means.index))

    plt.bar(x - bar_width / 2, division_means['F'], bar_width, label='F', color=COLORS['F'])
    plt.bar(x + bar_width / 2, division_means['M'], bar_width, label='M', color=COLORS['M'])

    plt.title('Average Race Times by Division', pad=20, fontsize=14)
    plt.xlabel('Age Group', fontsize=12)
    plt.ylabel('Average Net Time (MM:SS)', fontsize=12)

    plt.xticks(x, division_means.index, rotation=45)

    for i in range(len(x)):

        if not np.isnan(division_means['F'][i]):
            plt.text(x[i] - bar_width / 2, division_means['F'][i] + 50,
                     format_time_mmss(division_means['F'][i]),
                     rotation=90, ha='center', va='bottom')

        if not np.isnan(division_means['M'][i]):
            plt.text(x[i] + bar_width / 2, division_means['M'][i] + 50,
                     format_time_mmss(division_means['M'][i]),
                     rotation=90, ha='center', va='bottom')

    plt.legend(bbox_to_anchor=(1.15, 1), title='Gender')
    plt.grid(axis='y', linestyle='--', alpha=0.3)

    plt.subplots_adjust(right=0.85)
    plt.savefig('division_comparison.png', bbox_inches='tight', dpi=300)
    plt.close()

    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 12))

    sns.boxplot(x='Gender', y='Time_Diff_Sec', data=df, ax=ax1,
                palette=COLORS, showfliers=True)
    ax1.set_title('Gun Time vs Net Time Differences by Gender', pad=20)
    ax1.set_ylabel('Time Difference (seconds)')

    for i, gender in enumerate(COLORS.keys()):
        gender_data = df[df['Gender'] == gender]['Time_Diff_Sec']
        stats = gender_data.describe()
        ax1.text(i, stats['mean'], f"Mean: {stats['mean']:.1f}s",
                 horizontalalignment='center', verticalalignment='bottom',
                 bbox=dict(facecolor='white', alpha=0.8))
        ax1.text(i - 0.4, stats['25%'], f"Q1: {stats['25%']:.1f}s",
                 horizontalalignment='right', verticalalignment='center',
                 bbox=dict(facecolor='white', alpha=0.8))
        ax1.text(i - 0.4, stats['75%'], f"Q3: {stats['75%']:.1f}s",
                 horizontalalignment='right', verticalalignment='center',
                 bbox=dict(facecolor='white', alpha=0.8))

    bins = np.linspace(df['Time_Diff_Sec'].min(), df['Time_Diff_Sec'].max(), 50)

    ax2.hist([df[df['Gender'] == 'F']['Time_Diff_Sec'],
              df[df['Gender'] == 'M']['Time_Diff_Sec']],
             bins=bins, label=['Female', 'Male'],
             color=[COLORS['F'], COLORS['M']], alpha=0.7)

    ax2.set_title('Distribution of Gun vs Net Time Differences')
    ax2.set_xlabel('Time Difference (seconds)')
    ax2.set_ylabel('Count')
    ax2.legend(title='Gender')

    plt.tight_layout()
    plt.savefig('time_differences.png', dpi=300, bbox_inches='tight')
    plt.close()

    gender_stats = pd.DataFrame()
    gender_stats['mean'] = df.groupby('Gender')['Net_Time_Sec'].mean()
    gender_stats['median'] = df.groupby('Gender')['Net_Time_Sec'].median()
    gender_stats['mode'] = df.groupby('Gender')['Net_Time_Sec'].agg(lambda x: pd.Series.mode(x)[0])
    gender_stats['std'] = df.groupby('Gender')['Net_Time_Sec'].std()
    gender_stats['min'] = df.groupby('Gender')['Net_Time_Sec'].min()
    gender_stats['max'] = df.groupby('Gender')['Net_Time_Sec'].max()
    gender_stats['range'] = gender_stats['max'] - gender_stats['min']

    return {
        'gender_stats': gender_stats.round(2),
        'time_diff_stats': df.groupby('Gender')['Time_Diff_Sec'].describe().round(2),
        'division_stats': df.groupby(['Gender', 'Age_Group'])['Net_Time_Sec'].describe().round(2)
    }

stat_viz = visualize_race_analysis(cleaned_df)
stat_viz