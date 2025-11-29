"use client";
import React from 'react'
import { useI18n } from '@/components/LocaleProvider';

export default function Footer() {
	const { t, locale } = useI18n();
	const prefix = locale === "en" ? "" : `/${locale}`;

	return (
		<footer className="bg-[hsl(var(--bg))] text-[hsl(var(--fg))]">
			<div className="container mx-auto px-4 py-16">
				<div className="w-full">
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
						<div>
							<h4 className="text-sm tracking-widest text-slate-400 dark:text-slate-400 mb-6">{t('learn')}</h4>
							<ul className="space-y-4 text-base text-slate-700 dark:text-slate-300">
								<li><a href={`${prefix}/courses`} className="hover:underline">{t('courses')}</a></li>
								<li><a href={`${prefix}/lessons`} className="hover:underline">{t('lessons')}</a></li>
								<li><a href={`${prefix}/exercises`} className="hover:underline">{t('exercises')}</a></li>
								<li><a href={`${prefix}/certificates`} className="hover:underline">{t('certificates')}</a></li>
								<li><a href={`${prefix}/learning-paths`} className="hover:underline">{t('learningPaths')}</a></li>
							</ul>

							<h4 className="text-sm tracking-widest text-slate-400 dark:text-slate-400 mt-8 mb-6">{t('forBusiness')}</h4>
							<ul className="space-y-4 text-base text-slate-700 dark:text-slate-300">
								<li><a href={`${prefix}/business`} className="hover:underline">{t('businessSolutions')}</a></li>
								<li><a href={`${prefix}/schools`} className="hover:underline">{t('solutionsSchools')}</a></li>
								<li><a href={`${prefix}/pricing`} className="hover:underline">{t('pricing')}</a></li>
								<li><a href={`${prefix}/enterprise`} className="hover:underline">{t('enterprise')}</a></li>
							</ul>
						</div>

						<div>
							<h4 className="text-sm tracking-widest text-slate-400 dark:text-slate-400 mb-6">{t('coursesLevels')}</h4>
							<ul className="space-y-4 text-base text-slate-700 dark:text-slate-300">
								<li><a href={`${prefix}/levels/a1`} className="hover:underline">{t('levelsA1')}</a></li>
								<li><a href={`${prefix}/levels/a2`} className="hover:underline">{t('levelsA2')}</a></li>
								<li><a href={`${prefix}/levels/b1`} className="hover:underline">{t('levelsB1')}</a></li>
								<li><a href={`${prefix}/levels/b2`} className="hover:underline">{t('levelsB2')}</a></li>
								<li><a href={`${prefix}/conversation`} className="hover:underline">{t('conversationCourses')}</a></li>
							</ul>

							<h4 className="text-sm tracking-widest text-slate-400 dark:text-slate-400 mt-8 mb-6">{t('resources')}</h4>
							<ul className="space-y-4 text-base text-slate-700 dark:text-slate-300">
								<li><a href={`${prefix}/blog`} className="hover:underline">{t('blog')}</a></li>
								<li><a href={`${prefix}/podcast`} className="hover:underline">{t('podcast')}</a></li>
								<li><a href={`${prefix}/faq`} className="hover:underline">{t('faq')}</a></li>
								<li><a href={`${prefix}/help`} className="hover:underline">{t('helpSupport')}</a></li>
								<li><a href={`${prefix}/community`} className="hover:underline">{t('community')}</a></li>
							</ul>
						</div>

						<div>
							<h4 className="text-sm tracking-widest text-slate-400 dark:text-slate-400 mb-6">{t('company')}</h4>
							<ul className="space-y-4 text-base text-slate-700 dark:text-slate-300">
								<li><a href={`${prefix}/about`} className="hover:underline">{t('about')}</a></li>
								<li><a href={`${prefix}/team`} className="hover:underline">{t('team')}</a></li>
								<li><a href={`${prefix}/careers`} className="hover:underline">{t('careers')}</a></li>
								<li><a href={`${prefix}/press`} className="hover:underline">{t('press')}</a></li>
							</ul>

							<h4 className="text-sm tracking-widest text-slate-400 dark:text-slate-400 mt-8 mb-6">{t('legalContact')}</h4>
							<ul className="space-y-4 text-base text-slate-700 dark:text-slate-300">
								<li><a href={`${prefix}/imprint`} className="hover:underline">{t('imprint')}</a></li>
								<li><a href={`${prefix}/privacy`} className="hover:underline">{t('privacy')}</a></li>
								<li><a href={`${prefix}/terms`} className="hover:underline">{t('terms')}</a></li>
								<li><a href={`${prefix}/contact`} className="hover:underline">{t('contact')}</a></li>
							</ul>
						</div>
					</div>
				</div>

				{/* Bottom bar: copyright left */}
				<div className="mt-12 pt-6 text-sm text-slate-500 dark:text-slate-400">
					<div>© {new Date().getFullYear()} Simple Deutsch</div>
				</div>
			</div>
		</footer>
	);
}
